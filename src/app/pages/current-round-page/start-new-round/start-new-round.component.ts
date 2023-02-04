import { Component, OnInit } from '@angular/core'
import { GameService } from '../../../game/game.service'
import { Subscription } from 'rxjs'
import { Player } from '../../../game/game.model'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-start-new-round',
  templateUrl: './start-new-round.component.html',
  styleUrls: ['./start-new-round.component.css'],
})
export class StartNewRoundComponent implements OnInit {
  constructor(private _snackBar: MatSnackBar, private gameService: GameService) {}
  subscriptions: Subscription[] = []
  activePlayers: Player[] = []
  numberOfTables: number = 1
  numberPerTable: number = 1

  ngOnInit() {
    this.subscriptions.push(
      this.gameService.getActivePlayers().subscribe((players) => {
        this.activePlayers = players
      })
    )
  }

  changeNumberOfTables(number: number) {
    if (this.numberOfTables + number > 0) {
      this.numberOfTables += number
    }
  }

  changeNumberPerTable(number: number) {
    if (this.numberPerTable + number > 0) {
      this.numberPerTable += number
    }
  }

  startRound(): void {
    this.gameService.startRound(this.numberPerTable, this.numberOfTables).subscribe(
      () => {
        this._snackBar.open('New round started!', undefined, {
          duration: 3000,
        })
      },
      (error) =>
        this._snackBar.open(error.message, undefined, {
          duration: 3000,
        })
    )
  }

}
