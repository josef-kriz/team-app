import { Component, OnDestroy, OnInit } from '@angular/core'
import { GameService } from '../../../game/game.service'
import { Subscription } from 'rxjs'
import { Player } from '../../../game/game.model'
import { MatSnackBar } from '@angular/material/snack-bar'
import { PlayerService } from '../../../game/player.service'

@Component({
  selector: 'app-start-new-round',
  templateUrl: './start-new-round.component.html',
  styleUrls: ['./start-new-round.component.css'],
})
export class StartNewRoundComponent implements OnInit, OnDestroy {
  activePlayers: Player[] = []
  numberOfTables = { value: 1, plusDisabled: false }
  maxNumberPerTeam = { value: 1, plusDisabled: false }

  private subscriptions: Subscription[] = []

  constructor(private _snackBar: MatSnackBar, private gameService: GameService, private playerService: PlayerService) {}

  ngOnInit() {
    this.subscriptions.push(
      this.playerService.getActivePlayers().subscribe((players) => {
        this.activePlayers = players
        this.checkIfIncrementButtonsShouldBeDisabled()
      }),
      this.gameService.getLastRound().subscribe((lastRound) => {
        if (lastRound) {
          this.numberOfTables.value = lastRound.tables.length
          this.maxNumberPerTeam.value = lastRound.tables[0].teams[0].players.length
        }
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe())
  }

  changeNumberOfTables(number: number) {
    if (this.numberOfTables.value + number > 0) {
      this.numberOfTables.value += number
    }
    this.checkIfIncrementButtonsShouldBeDisabled()
  }

  changeNumberPerTable(number: number) {
    if (this.maxNumberPerTeam.value + number > 0) {
      this.maxNumberPerTeam.value += number
    }
    this.checkIfIncrementButtonsShouldBeDisabled()
  }

  checkIfIncrementButtonsShouldBeDisabled() {
    const possiblePlayers = this.maxNumberPerTeam.value * 2 * this.numberOfTables.value
    if (possiblePlayers >= this.activePlayers.length) {
      this.maxNumberPerTeam.plusDisabled = true
      this.numberOfTables.plusDisabled = true
    } else {
      this.maxNumberPerTeam.plusDisabled = false
      this.numberOfTables.plusDisabled = false
    }
  }

  startRound(): void {
    this.gameService.startRound(this.maxNumberPerTeam.value, this.numberOfTables.value).subscribe({
      next: () => {
        this._snackBar.open('New round started!', undefined, {
          duration: 3000,
        })
      },
      error: (error) =>
        this._snackBar.open(error.message, undefined, {
          duration: 3000,
        }),
    })
  }
}
