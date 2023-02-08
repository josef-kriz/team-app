import { Component, OnInit } from '@angular/core'
import { StatsService } from '../../game/stats.service'
import { PlayerStats } from '../../game/game.model'
import { SortDirection } from '@angular/material/sort'
import { Plotly } from 'angular-plotly.js/lib/plotly.interface'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-stats-page',
  templateUrl: './stats-page.component.html',
  styleUrls: ['./stats-page.component.css'],
})
export class StatsPageComponent implements OnInit {
  playerStats?: PlayerStats[]

  winsData$: Observable<Plotly.Data>
  scoreData$: Observable<Plotly.Data>

  winsPlotLayout
  scorePlotLayout

  private plotLayoutBase = {
    autosize: true,
    plot_bgcolor: 'transparent',
    paper_bgcolor: 'transparent',
    xaxis: {
      title: 'Round #',
      gridcolor: 'rgba(255,255,255,0.2)',
      dtick: 1,
    },
    yaxis: {
      gridcolor: 'rgba(255,255,255,0.2)',
      dtick: 1,
    },
    font: {
      color: '#ffffffC3',
    },
  }



  constructor(private statsService: StatsService) {
    this.winsData$ = this.statsService.getPlotData('wins')
    this.scoreData$ = this.statsService.getPlotData('score')
    this.winsPlotLayout = {
      ...this.plotLayoutBase,
      title: 'Wins',
      yaxis: {
        ...this.plotLayoutBase.yaxis,
        title: 'Wins'
      }
    }
    this.scorePlotLayout = {
      ...this.plotLayoutBase,
      title: 'Relative score',
      yaxis: {
        ...this.plotLayoutBase.yaxis,
        title: 'Relative score'
      }
    }
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
