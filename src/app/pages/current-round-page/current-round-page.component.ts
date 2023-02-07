import { Component, OnInit } from '@angular/core'
import { GameService } from '../../game/game.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Round } from '../../game/game.model'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-current-round-page',
  templateUrl: './current-round-page.component.html',
  styleUrls: ['./current-round-page.component.css'],
})
export class CurrentRoundPageComponent implements OnInit {
  currentRound?: Round
  subscriptions: Subscription[] = []

  constructor(private _snackBar: MatSnackBar, private gameService: GameService) {}

  ngOnInit() {
    this.subscriptions.push(
      this.gameService.getActiveRound().subscribe((r) => {
        this.currentRound = r
      })
    )
  }
  
  endRound(): void {
    this.gameService.endRound().subscribe({
      next: () => {
        this._snackBar.open('Round ended', undefined, {
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
