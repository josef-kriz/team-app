import { Component } from '@angular/core'
import { GameService } from '../../game/game.service'
import { map, Observable, reduce } from 'rxjs'
import { Player } from '../../game/game.model'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-players-page',
  templateUrl: './players-page.component.html',
  styleUrls: ['./players-page.component.css'],
})
export class PlayersPageComponent {
  readonly activePlayers$: Observable<Player[]>
  readonly inactivePlayers$: Observable<Player[]>

  constructor(private _snackBar: MatSnackBar, private gameService: GameService) {
    this.activePlayers$ = this.gameService.getPlayers().pipe(map((player) => player.filter((p) => !!p.active)))
    this.inactivePlayers$ = this.gameService.getPlayers().pipe(map((player) => player.filter((p) => !p.active)))
  }

  trackById(_: number, player: Player): number {
    return player.id!
  }

  toggleActivness(player: Player) {
    this.gameService.toggleActiveOnPlayer(player)
  }

  addPlayer(nameField: HTMLInputElement): void {
    this.gameService.addPlayer(nameField.value).subscribe(
      () => {
        nameField.value = ''
        this._snackBar.open('Player added', undefined, {
          duration: 3000,
        })
      },
      (error) =>
        this._snackBar.open(error.message, undefined, {
          duration: 3000,
        })
    )
  }

  deletePlayer(player: Player): void {
    this.gameService.deletePlayer(player.id!).subscribe(
      () => {
        this._snackBar.open('Player deleted', undefined, {
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
