import {Component, Input, OnInit} from '@angular/core'
import { Round, Table } from '../../../game/game.model'
import { GameService } from '../../../game/game.service'
import {MatDialog} from '@angular/material/dialog'
import { ReorderTeamsComponent } from './reorder-teams/reorder-teams.component'

@Component({
  selector: 'app-result-input',
  templateUrl: './result-input.component.html',
  styleUrls: ['./result-input.component.css'],
})
export class ResultInputComponent implements OnInit {
  @Input() round?: Round
  constructor(private gameService: GameService, public dialog: MatDialog) {}

  ngOnInit() {}

  changeScore(tableId: number, score1: string, score2: string) {
    this.gameService.setResults(tableId, parseInt(score1), parseInt(score2)).subscribe()
  }

  trackById(_: number, table: Table): number {
    return table.id
  }

  openReorderTeamsModal(currentRound: Round) {
    const dialogRef = this.dialog.open(ReorderTeamsComponent, {
      data: currentRound,
    })

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed')
      console.log(result)
    })
  }
}
