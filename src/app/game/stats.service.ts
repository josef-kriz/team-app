import { Injectable } from '@angular/core'
import { db } from './database/db'
import { combineLatest, from, map, Observable } from 'rxjs'
import { PlayerStats } from './game.model'
import { PlayerService } from './player.service'

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  constructor(private playerService: PlayerService) {}

  getPlayerStats(): Observable<PlayerStats[]> {
    return combineLatest([from(db.rounds.toArray()), this.playerService.getPlayers()]).pipe(
      map(([rounds, players]) => {
        return rounds.reduce((acc, round) => {
          if (round.scores) {
            Object.entries(round.scores).forEach(([playerId, playerStats]) => {
              const score = Object.values(playerStats)[0]

              if (acc[playerId]) {
                acc[playerId].score += score.score > 0 ? score.score : 0
                acc[playerId].relativeScore += score.score
                acc[playerId].wins += score.wins
              } else
                acc[playerId] = {
                  ...score,
                  player: players.find((p) => p.id! === parseInt(playerId)) || {
                    id: Math.random(),
                    active: 0,
                    name: 'Unknown player',
                  },
                  relativeScore: 0,
                }
            })
          }
          return acc
        }, {} as { [key: string]: PlayerStats })
      }),
      map(stats => Object.values(stats))
    )
  }

  getPlotData(): Observable<any[]> {
    return combineLatest([from(db.rounds.toArray()), this.playerService.getPlayers()]).pipe(
      map(([rounds, players]) => {
        return rounds.reduce((acc, round) => {
          if (round.scores) {

          }
          return acc
        }, [])
      }),
      map(stats => Object.values(stats))
    )
  }
}
