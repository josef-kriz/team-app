import { Component, OnInit } from '@angular/core'
import { StatsService } from '../../game/stats.service'
import { PlayerStats } from '../../game/game.model'
import { SortDirection } from '@angular/material/sort'
import { Plotly } from 'angular-plotly.js/lib/plotly.interface'

@Component({
  selector: 'app-stats-page',
  templateUrl: './stats-page.component.html',
  styleUrls: ['./stats-page.component.css'],
})
export class StatsPageComponent implements OnInit {
  playerStats?: PlayerStats[]

  graph = {
    data: [] as Plotly.Data[],
    layout: {
      autosize: true,
      plot_bgcolor: 'transparent',
      paper_bgcolor: 'transparent',
      title: 'Total wins',
      xaxis: {
        title: 'Round #',
        gridcolor: 'rgba(255,255,255,0.2)',
        dtick: 1
      },
      yaxis: {
        title: 'Wins',
        gridcolor: 'rgba(255,255,255,0.2)',
        dtick: 1
      },
      font: {
        color: '#ffffffC3'
      }
    },
  }

  constructor(private statsService: StatsService) {
    this.statsService.getPlotData().subscribe((plotData) => (this.graph.data = plotData))
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
