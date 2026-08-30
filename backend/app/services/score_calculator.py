from typing import List, Dict, Any, Tuple, Optional
from app.models.schemas import (
    ScoreBreakdown, 
    ArchetypeInfo, 
    DuoStats, 
    CompatibilityResponse,
    CommonMatchSummary,
    PlayerMatchPerformance
)

class AffinityScoreCalculator:
    """
    Algorithme complet d'évaluation de la compatibilité amoureuse et amicale en duo League of Legends.
    Calcule un score pondéré sur 100 points et génère une analyse psychologique personnalisée.
    """

    @classmethod
    def calculate_duo_affinity(
        self,
        player1_name: str,
        player1_tag: str,
        player2_name: str,
        player2_tag: str,
        duo_matches: List[Dict[str, Any]],
        puuid1: str,
        puuid2: str
    ) -> CompatibilityResponse:
        """
        Calcule le score global et produit le rapport complet pour l'application.
        """
        total_games = len(duo_matches)

        if total_games == 0:
            # Aucun match commun trouvé
            return self._build_empty_response(player1_name, player1_tag, player2_name, player2_tag)

        wins = 0
        losses = 0
        total_duration_sec = 0
        total_shared_kills = 0
        total_team_kills = 0

        p1_total_kills, p1_total_deaths, p1_total_assists = 0, 0, 0
        p2_total_kills, p2_total_deaths, p2_total_assists = 0, 0, 0

        lane_pair_counts: Dict[str, int] = {}
        champ_pair_counts: Dict[str, int] = {}

        formatted_common_matches: List[CommonMatchSummary] = []

        for m in duo_matches:
            info = m["info"]
            p1 = m["player1_participant"]
            p2 = m["player2_participant"]

            is_win = p1.get("win", False)
            if is_win:
                wins += 1
            else:
                losses += 1

            duration = info.get("gameDuration", 1800)
            total_duration_sec += duration

            # Cumul KDA individual
            p1_kills, p1_deaths, p1_assists = p1.get("kills", 0), p1.get("deaths", 0), p1.get("assists", 0)
            p2_kills, p2_deaths, p2_assists = p2.get("kills", 0), p2.get("deaths", 0), p2.get("assists", 0)

            p1_total_kills += p1_kills
            p1_total_deaths += p1_deaths
            p1_total_assists += p1_assists
            p2_total_kills += p2_kills
            p2_total_deaths += p2_deaths
            p2_total_assists += p2_assists

            # Estimation des kills/assists partagés dans cette partie
            # Un kill partagé est un kill où l'un fait le kill et l'autre fait l'assist, ou les deux participent
            shared_in_match = min(p1_kills, p2_assists) + min(p2_kills, p1_assists)
            total_shared_kills += shared_in_match

            # Rôles et Champions
            r1 = p1.get("individualPosition", p1.get("teamPosition", "UNKNOWN"))
            r2 = p2.get("individualPosition", p2.get("teamPosition", "UNKNOWN"))
            
            lane_key = self._format_lane_combo(r1, r2)
            lane_pair_counts[lane_key] = lane_pair_counts.get(lane_key, 0) + 1

            c1 = p1.get("championName", "Unknown")
            c2 = p2.get("championName", "Unknown")
            champ_key = f"{c1} & {c2}"
            champ_pair_counts[champ_key] = champ_pair_counts.get(champ_key, 0) + 1

            # Construction de l'objet résumé de match
            formatted_common_matches.append(
                CommonMatchSummary(
                    matchId=m.get("metadata", {}).get("matchId", "UNKNOWN"),
                    gameMode=info.get("gameMode", "CLASSIC"),
                    gameDurationSeconds=duration,
                    gameCreationTimestamp=info.get("gameCreation", 0),
                    win=is_win,
                    player1=PlayerMatchPerformance(
                        puuid=puuid1,
                        gameName=player1_name,
                        tagLine=player1_tag,
                        championId=p1.get("championId", 0),
                        championName=c1,
                        role=r1,
                        kills=p1_kills,
                        deaths=p1_deaths,
                        assists=p1_assists,
                        win=is_win,
                        goldEarned=p1.get("goldEarned", 0),
                        totalDamageDealtToChampions=p1.get("totalDamageDealtToChampions", 0)
                    ),
                    player2=PlayerMatchPerformance(
                        puuid=puuid2,
                        gameName=player2_name,
                        tagLine=player2_tag,
                        championId=p2.get("championId", 0),
                        championName=c2,
                        role=r2,
                        kills=p2_kills,
                        deaths=p2_deaths,
                        assists=p2_assists,
                        win=is_win,
                        goldEarned=p2.get("goldEarned", 0),
                        totalDamageDealtToChampions=p2.get("totalDamageDealtToChampions", 0)
                    ),
                    sharedKillsCount=shared_in_match
                )
            )

        # Calculs des métriques
        winrate_pct = round((wins / total_games) * 100, 1)
        avg_duration_min = round((total_duration_sec / total_games) / 60, 1)

        # Participation aux éliminations conjointes (%)
        total_kills_sum = max(1, p1_total_kills + p2_total_kills)
        joint_kp_pct = min(100.0, round((total_shared_kills * 2 / total_kills_sum) * 100, 1))

        # Lane la plus jouée
        favorite_lane_combo = max(lane_pair_counts, key=lane_pair_counts.get) if lane_pair_counts else "Flex Duo"
        # Champion duo le plus joué
        top_champ_duo = max(champ_pair_counts, key=champ_pair_counts.get) if champ_pair_counts else None

        # Pilier 1 : Winrate Score (35 points max)
        if winrate_pct >= 75:
            winrate_score = 35.0
        elif winrate_pct >= 65:
            winrate_score = 30.0 + (winrate_pct - 65) * 0.5
        elif winrate_pct >= 50:
            winrate_score = 20.0 + (winrate_pct - 50) * 0.67
        elif winrate_pct >= 40:
            winrate_score = 12.0 + (winrate_pct - 40) * 0.8
        else:
            winrate_score = max(5.0, winrate_pct * 0.25)

        # Pilier 2 : Synergy Score (30 points max)
        if joint_kp_pct >= 55:
            synergy_score = 30.0
        elif joint_kp_pct >= 40:
            synergy_score = 22.0 + (joint_kp_pct - 40) * 0.53
        elif joint_kp_pct >= 25:
            synergy_score = 15.0 + (joint_kp_pct - 25) * 0.46
        else:
            synergy_score = max(5.0, joint_kp_pct * 0.6)

        # Pilier 3 : Role Score (20 points max)
        role_score = self._calculate_role_score(favorite_lane_combo, top_champ_duo)

        # Pilier 4 : Volume Score (15 points max)
        if total_games >= 20:
            volume_score = 15.0
        elif total_games >= 10:
            volume_score = 12.0 + (total_games - 10) * 0.3
        elif total_games >= 5:
            volume_score = 8.0 + (total_games - 5) * 0.8
        else:
            volume_score = total_games * 1.6

        # Score global final
        overall_score = min(100, max(0, int(round(winrate_score + synergy_score + role_score + volume_score))))

        # Génération de l'archétype
        archetype_info = self._determine_archetype(
            overall_score, 
            winrate_pct, 
            joint_kp_pct, 
            favorite_lane_combo, 
            total_games,
            p1_total_assists,
            p2_total_assists,
            p1_total_kills,
            p2_total_kills
        )

        duo_stats = DuoStats(
            totalGamesTogether=total_games,
            winsTogether=wins,
            lossesTogether=losses,
            winratePercent=winrate_pct,
            sharedKillsAssistsTotal=total_shared_kills,
            jointKillParticipationPercent=joint_kp_pct,
            favoriteLaneCombo=favorite_lane_combo,
            topChampionDuo=top_champ_duo,
            avgDurationMinutes=avg_duration_min
        )

        score_breakdown = ScoreBreakdown(
            winrateScore=round(winrate_score, 1),
            synergyScore=round(synergy_score, 1),
            roleScore=round(role_score, 1),
            volumeScore=round(volume_score, 1)
        )

        p1_summary = {
            "gameName": player1_name,
            "tagLine": player1_tag,
            "totalKills": p1_total_kills,
            "totalDeaths": p1_total_deaths,
            "totalAssists": p1_total_assists,
            "kdaRatio": round((p1_total_kills + p1_total_assists) / max(1, p1_total_deaths), 2)
        }

        p2_summary = {
            "gameName": player2_name,
            "tagLine": player2_tag,
            "totalKills": p2_total_kills,
            "totalDeaths": p2_total_deaths,
            "totalAssists": p2_total_assists,
            "kdaRatio": round((p2_total_kills + p2_total_assists) / max(1, p2_total_deaths), 2)
        }

        return CompatibilityResponse(
            overallScore=overall_score,
            scoreBreakdown=score_breakdown,
            archetype=archetype_info,
            duoStats=duo_stats,
            player1Summary=p1_summary,
            player2Summary=p2_summary,
            commonMatches=formatted_common_matches,
            isDemoData=False
        )

    @classmethod
    def _format_lane_combo(cls, r1: str, r2: str) -> str:
        """Harmonise le nom du duo de voies."""
        r1, r2 = r1.upper(), r2.upper()
        if (r1 == "BOTTOM" and r2 == "UTILITY") or (r2 == "BOTTOM" and r1 == "UTILITY"):
            return "Botlane Duo (ADC & Support)"
        elif (r1 == "MIDDLE" and r2 == "JUNGLE") or (r2 == "MIDDLE" and r1 == "JUNGLE"):
            return "Mid-Jungle Synergy"
        elif (r1 == "TOP" and r2 == "JUNGLE") or (r2 == "TOP" and r1 == "JUNGLE"):
            return "Top-Jungle Alliance"
        elif (r1 == "MIDDLE" and r2 == "BOTTOM") or (r2 == "MIDDLE" and r1 == "BOTTOM"):
            return "Mid & Carry Duo"
        elif r1 == r2 and r1 != "UNKNOWN":
            return f"Same Lane ({r1})"
        return "Flex Roaming Duo"

    @classmethod
    def _calculate_role_score(cls, lane_combo: str, champ_duo: Optional[str]) -> float:
        """Attribue un score de complémentarité selon la voie et les champions."""
        base_role_score = 14.0
        if "Botlane Duo" in lane_combo:
            base_role_score = 19.5
        elif "Mid-Jungle" in lane_combo:
            base_role_score = 18.5
        elif "Top-Jungle" in lane_combo:
            base_role_score = 17.5
        elif "Mid & Carry" in lane_combo:
            base_role_score = 16.5

        # Bonus champions iconiques
        bonus = 0.0
        if champ_duo:
            cd_upper = champ_duo.upper()
            famous_synergies = [
                "LUCIAN", "NAMI", "XAYAH", "RAKAN", "YASUO", "GRAGAS", 
                "CAITLYN", "LUX", "KOG'MAW", "LULU", "BRAUM", "JINX", "THRESH", "GALIO", "JARVAN"
            ]
            matches_count = sum(1 for hero in famous_synergies if hero in cd_upper)
            if matches_count >= 2:
                bonus = 1.0

        return min(20.0, base_role_score + bonus)

    @classmethod
    def _determine_archetype(
        cls,
        overall_score: int,
        winrate_pct: float,
        joint_kp: float,
        lane_combo: str,
        total_games: int,
        p1_assists: int,
        p2_assists: int,
        p1_kills: int,
        p2_kills: int
    ) -> ArchetypeInfo:
        """
        Détermine l'archétype thématique du duo selon le comportement et les performances.
        """
        if overall_score >= 88:
            return ArchetypeInfo(
                title="Âmes Sœurs de la Faille",
                subtitle="Compatibilité légendaire & télépathie absolue",
                quote="« Nous sommes plus qu'une équipe, nous sommes une seule âme sur deux postes. »",
                description="Votre synchronisation frôle le divin. Vous comprenez les intentions de votre partenaire avant même qu'il ne clique sur la carte. Que ce soit pour un engage décisif ou un clutch sous tour, votre duo rayonne.",
                badgeGradient="from-amber-400 via-rose-500 to-purple-600",
                iconName="heart_crown"
            )

        if "Botlane Duo" in lane_combo and winrate_pct >= 55:
            return ArchetypeInfo(
                title="Âmes Sœurs de la Botlane",
                subtitle="Harmonie ADC & Support indéboulonnable",
                quote="« Un bouclier pour te protéger, un arc pour conquérir la Faille. »",
                description="Vous formez le duo classique et romantique par excellence. L'un crée les opportunités, l'autre concrétise les éliminations. La Botlane adverse tremble à la seule vue de votre écran de chargement.",
                badgeGradient="from-pink-500 via-purple-500 to-indigo-600",
                iconName="duo_sparkles"
            )

        if joint_kp >= 50:
            return ArchetypeInfo(
                title="Le Tandem Explosif",
                subtitle="Inséparables dans chaque combat d'équipe",
                quote="« Là où tu vas, j'apporte les dégâts ! »",
                description="Votre participation conjointe aux éliminations est phénoménale ! Vous ne jouez pas deux champions séparés, vous combattez toujours en meute. Les skirmishes 2v2 sont votre terrain de jeu favori.",
                badgeGradient="from-red-500 via-orange-500 to-amber-500",
                iconName="swords_flame"
            )

        if (p1_assists > p1_kills * 1.8) or (p2_assists > p2_kills * 1.8):
            return ArchetypeInfo(
                title="Protecteur & Carry",
                subtitle="L'ange gardien et la lame vengeresse",
                quote="« Laisse-moi encaisser les coups, tu t'occupes de la victoire. »",
                description="L'un veille dans l'ombre avec dévouement, lançant des boucliers et des soins in extremis, tandis que l'autre accumule les pentakills. Une relation basée sur la confiance et le sacrifice mutuel.",
                badgeGradient="from-cyan-400 via-blue-500 to-indigo-700",
                iconName="shield_heart"
            )

        if "Mid-Jungle" in lane_combo:
            return ArchetypeInfo(
                title="Les Maîtres du Tempo",
                subtitle="Domination de la carte & roams meurtriers",
                quote="« La carte nous appartient, nous dictons le rythme du jeu. »",
                description="En contrôlant le cœur de la Faille, vous étouffez les espoirs adverses. Vos décalements coordonnés et vos ganks chirurgicaux garantissent la victoire.",
                badgeGradient="from-purple-500 via-indigo-600 to-blue-600",
                iconName="compass_magic"
            )

        if winrate_pct < 45 and total_games >= 5:
            return ArchetypeInfo(
                title="Duo Toxique & Passionné",
                subtitle="L'amour vache dans la défaite comme dans la victoire",
                quote="« Je te déteste quand tu gankes, mais je ne peux pas jouer sans toi. »",
                description="Le score ne rend pas toujours justice à votre passion ! Vous enchaînez les parties avec une intensité folle, vous disputant chaque sbire et chaque dragon, mais vous revenez toujours jouer ensemble.",
                badgeGradient="from-emerald-400 via-teal-600 to-slate-900",
                iconName="skull_heart"
            )

        if total_games <= 3:
            return ArchetypeInfo(
                title="Rencontre Prometteuse",
                subtitle="Premières étincelles sur la Faille",
                quote="« Le début d'une grande histoire d'amour ou de climb ranked... »",
                description="Vous n'avez que quelques parties en commun, mais la chimie est bien présente ! Continuez à enchaîner les matchs pour débloquer votre véritable potentiel de duo.",
                badgeGradient="from-sky-400 via-indigo-400 to-pink-400",
                iconName="sparkler"
            )

        # Archétype par défaut équilibré
        return ArchetypeInfo(
            title="Frères d'Armes de la Faille",
            subtitle="Duo solide & camarades de jeu fidèles",
            quote="« Côte à côte face au Nexus adverse. »",
            description="Un duo équilibré et fiable. Vous vous soutenez mutuellement dans les moments difficiles de la partie et partagez une complicité constante.",
            badgeGradient="from-blue-500 via-indigo-500 to-purple-500",
            iconName="users_shield"
        )

    @classmethod
    def _build_empty_response(
        cls,
        player1_name: str,
        player1_tag: str,
        player2_name: str,
        player2_tag: str
    ) -> CompatibilityResponse:
        """Génère un score d'affinité théorique dynamique quand aucun match commun récent n'est trouvé."""
        seed_hash = sum(ord(c) for c in (player1_name.lower() + player2_name.lower()))
        calculated_score = 74 + (seed_hash % 23)

        return CompatibilityResponse(
            overallScore=calculated_score,
            scoreBreakdown=ScoreBreakdown(
                winrateScore=18,
                synergyScore=22,
                roleScore=18,
                volumeScore=18
            ),
            archetype=ArchetypeInfo(
                title="Âmes Sœurs de la Faille",
                subtitle="Compatibilité théorique & synergie prometteuse",
                quote="« Vos destins sont liés sur la Faille de l'Invocateur. »",
                description="Aucun match récent enregistré en duo dans l'historique direct, mais votre affinité théorique et la synergie de vos profils annoncent un duo formidable !",
                badgeGradient="from-pink-500 via-purple-500 to-indigo-600",
                iconName="duo_sparkles"
            ),
            duoStats=DuoStats(
                totalGamesTogether=0,
                winsTogether=0,
                lossesTogether=0,
                winratePercent=0.0,
                sharedKillsAssistsTotal=0,
                jointKillParticipationPercent=0.0,
                favoriteLaneCombo="Botlane / Mid",
                topChampionDuo="Synergie Théorique",
                avgDurationMinutes=0.0
            ),
            player1Summary={"gameName": player1_name, "tagLine": player1_tag},
            player2Summary={"gameName": player2_name, "tagLine": player2_tag},
            commonMatches=[],
            isDemoData=False
        )

    @classmethod
    def get_demo_compatibility(cls) -> CompatibilityResponse:
        """
        Génère une réponse de démonstration époustouflante sans avoir besoin de clé API Riot.
        Idéal pour tester l'application ou l'exposer publiquement en démo.
        """
        return CompatibilityResponse(
            overallScore=94,
            scoreBreakdown=ScoreBreakdown(
                winrateScore=34.5,
                synergyScore=28.5,
                roleScore=19.5,
                volumeScore=11.5
            ),
            archetype=ArchetypeInfo(
                title="Âmes Sœurs de la Botlane",
                subtitle="Harmonie ADC & Support indéboulonnable",
                quote="« Un bouclier pour te protéger, un arc pour conquérir la Faille. »",
                description="Vous formez le duo classique et le plus fusionnel de League of Legends. Votre compréhension mutuelle frôle la télépathie : quand l'un décoche une flèche de cristal, l'autre enchaîne instantanément le contrôle. Votre complicité en fait le cauchemar de la Botlane adverse !",
                badgeGradient="from-pink-500 via-purple-500 to-indigo-600",
                iconName="duo_sparkles"
            ),
            duoStats=DuoStats(
                totalGamesTogether=18,
                winsTogether=14,
                lossesTogether=4,
                winratePercent=77.8,
                sharedKillsAssistsTotal=142,
                jointKillParticipationPercent=68.4,
                favoriteLaneCombo="Botlane Duo (ADC & Support)",
                topChampionDuo="Lucian & Nami",
                avgDurationMinutes=27.4
            ),
            player1Summary={
                "gameName": "CupidCarry",
                "tagLine": "LOVE",
                "totalKills": 164,
                "totalDeaths": 42,
                "totalAssists": 98,
                "kdaRatio": 6.24
            },
            player2Summary={
                "gameName": "AngelPeel",
                "tagLine": "HEAL",
                "totalKills": 22,
                "totalDeaths": 38,
                "totalAssists": 240,
                "kdaRatio": 6.89
            },
            commonMatches=[
                CommonMatchSummary(
                    matchId="EUW1_68492019",
                    gameMode="CLASSIC",
                    gameDurationSeconds=1740,
                    gameCreationTimestamp=1716000000000,
                    win=True,
                    player1=PlayerMatchPerformance(
                        puuid="demo_p1", gameName="CupidCarry", tagLine="LOVE",
                        championId=236, championName="Lucian", role="BOTTOM",
                        kills=14, deaths=2, assists=8, win=True, goldEarned=16400, totalDamageDealtToChampions=34200
                    ),
                    player2=PlayerMatchPerformance(
                        puuid="demo_p2", gameName="AngelPeel", tagLine="HEAL",
                        championId=267, championName="Nami", role="UTILITY",
                        kills=2, deaths=1, assists=18, win=True, goldEarned=10800, totalDamageDealtToChampions=11500
                    ),
                    sharedKillsCount=18
                ),
                CommonMatchSummary(
                    matchId="EUW1_68491888",
                    gameMode="CLASSIC",
                    gameDurationSeconds=1620,
                    gameCreationTimestamp=1715980000000,
                    win=True,
                    player1=PlayerMatchPerformance(
                        puuid="demo_p1", gameName="CupidCarry", tagLine="LOVE",
                        championId=498, championName="Xayah", role="BOTTOM",
                        kills=11, deaths=3, assists=6, win=True, goldEarned=14800, totalDamageDealtToChampions=28900
                    ),
                    player2=PlayerMatchPerformance(
                        puuid="demo_p2", gameName="AngelPeel", tagLine="HEAL",
                        championId=497, championName="Rakan", role="UTILITY",
                        kills=1, deaths=2, assists=14, win=True, goldEarned=9900, totalDamageDealtToChampions=8400
                    ),
                    sharedKillsCount=14
                ),
                CommonMatchSummary(
                    matchId="EUW1_68491001",
                    gameMode="CLASSIC",
                    gameDurationSeconds=1980,
                    gameCreationTimestamp=1715950000000,
                    win=False,
                    player1=PlayerMatchPerformance(
                        puuid="demo_p1", gameName="CupidCarry", tagLine="LOVE",
                        championId=222, championName="Jinx", role="BOTTOM",
                        kills=8, deaths=5, assists=4, win=False, goldEarned=13100, totalDamageDealtToChampions=26500
                    ),
                    player2=PlayerMatchPerformance(
                        puuid="demo_p2", gameName="AngelPeel", tagLine="HEAL",
                        championId=412, championName="Thresh", role="UTILITY",
                        kills=1, deaths=6, assists=9, win=False, goldEarned=8700, totalDamageDealtToChampions=7200
                    ),
                    sharedKillsCount=9
                )
            ],
            isDemoData=True
        )
