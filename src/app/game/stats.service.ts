import { Injectable } from '@angular/core'
import { db } from './database/db'
import { combineLatest, from, map, Observable } from 'rxjs'
import { PlayerStats } from './game.model'
import { PlayerService } from './player.service'
import { Plotly } from 'angular-plotly.js/lib/plotly.interface'

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
      map((stats) => Object.values(stats))
    )
  }

  getPlotData(): Observable<any[]> {
    return combineLatest([from(db.rounds.toArray()), this.playerService.getPlayers()]).pipe(
      map(([rounds, players]) => {
        const preAcc = players.reduce((acc, player) => {
          acc[player.id!] = {
            x: [],
            y: [],
            mode: 'lines',
            name: player.name,
            line: {
              dash: 'solid',
              width: 3,
            },
          }
          return acc
        }, {} as { [key: string]: Plotly.Data })

        return rounds.reduce((acc, round, i) => {
          if (round.scores) {
            Object.entries(round.scores).forEach(([playerId, playerStats]) => {
              const score = Object.values(playerStats)[0]

              if (acc[playerId].x.length) {
                acc[playerId].x.push(acc[playerId].x[acc[playerId].x.length - 1] + 1)
                acc[playerId].y.push(acc[playerId].y[acc[playerId].y.length - 1] + score.wins)
              } else {
                acc[playerId].x.push(i + 1)
                acc[playerId].y.push(score.wins)
              }
            })

            players.forEach((player) => {
              if (acc[player.id!].x.length !== i + 1) {
                acc[player.id!].x.push(i + 1)
                acc[player.id!].y.push(i === 0 ? 0 : acc[player.id!].y[acc[player.id!].y.length - 1])
              }
            })
          }
          return acc
        }, preAcc)
      }),
      map((stats) => Object.values(stats))
    )
  }
}
