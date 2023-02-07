import { Component, OnInit } from '@angular/core'
import { StatsService } from '../../game/stats.service'
import { PlayerStats } from '../../game/game.model'
import { SortDirection } from '@angular/material/sort'

@Component({
  selector: 'app-stats-page',
  templateUrl: './stats-page.component.html',
  styleUrls: ['./stats-page.component.css'],
})
export class StatsPageComponent implements OnInit {
  playerStats?: PlayerStats[]

  graph = {
    data: [{
      x: [2, 3, 4, 5],
      y: [16, 5, 11, 9],
      mode: 'lines',
      line: {
        color: 'rgb(55, 128, 191)',
        width: 3
      }
    }],
    layout: {autosize: true, title: 'A Fancy Plot'},
  }

  constructor(private statsService: StatsService) {
  }

  ngOnInit() {
    this.statsService.getPlayerStats().subscribe((stats) => {
      this.playerStats = stats
      this.sortData('wins', 'desc')
    })
  }

  sortData(sortBy: string, direction: SortDirection) {
    this.playerStats?.sort((playerStatsA, playerStatsB) => {
      if (sortBy === 'name') return playerStatsA.player.name.localeCompare(playerStatsB.player.name)
      else if (sortBy === 'wins') return playerStatsA.wins - playerStatsB.wins
      else if (sortBy === 'score') return playerStatsA.score - playerStatsB.score
      else return playerStatsA.relativeScore - playerStatsB.relativeScore
    })

    if (direction === 'desc') this.playerStats?.reverse()
  }
}
