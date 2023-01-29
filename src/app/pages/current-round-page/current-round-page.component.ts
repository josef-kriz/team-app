import { Component } from '@angular/core';
import { PlayersPageComponent } from '../players-page/players-page.component'
import { MatDialog } from '@angular/material/dialog'
import { GameService } from '../../game/game.service'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-current-round-page',
  templateUrl: './current-round-page.component.html',
  styleUrls: ['./current-round-page.component.css']
})
export class CurrentRoundPageComponent {
  currentRound:boolean = false

  constructor(private _snackBar: MatSnackBar, private gameService: GameService){}

}
