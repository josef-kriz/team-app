import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PlayersPageComponent } from './pages/players-page/players-page.component'
import { MatTabsModule } from '@angular/material/tabs';
import { CurrentRoundPageComponent } from './pages/current-round-page/current-round-page.component';
import { StatsPageComponent } from './pages/stats-page/stats-page.component'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatIconModule } from '@angular/material/icon'
import { MatDialogModule } from '@angular/material/dialog';
import { StartNewRoundComponent } from './pages/current-round-page/start-new-round/start-new-round.component';
import { ResultInputComponent } from './pages/current-round-page/result-input/result-input.component'
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { ReorderTeamsComponent } from './pages/current-round-page/result-input/reorder-teams/reorder-teams.component';
import { MatSortModule } from '@angular/material/sort'
import { PlotlyModule } from 'angular-plotly.js'
import * as PlotlyJS from 'plotly.js-dist-min'

PlotlyModule.plotlyjs = PlotlyJS;
import {MatMenuModule} from "@angular/material/menu";
import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop'

@NgModule({
  declarations: [
    AppComponent,
    PlayersPageComponent,
    CurrentRoundPageComponent,
    StatsPageComponent,
    StartNewRoundComponent,
    ResultInputComponent,
    ReorderTeamsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatTabsModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule,
    MatListModule,
    MatCardModule,
    MatSortModule,
    PlotlyModule,
    MatMenuModule,
    CdkDropList,
    CdkDrag,
    CdkDropListGroup,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
