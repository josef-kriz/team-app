import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PlayersPageComponent } from "./pages/players-page/players-page.component";
import { CurrentRoundPageComponent } from './pages/current-round-page/current-round-page.component'
import { StatsPageComponent } from './pages/stats-page/stats-page.component'

const routes: Routes = [
  { path: "players", component: PlayersPageComponent },
  { path: "stats", component: StatsPageComponent },
  { path: "current-round", component: CurrentRoundPageComponent },
  //the empty path has to show something for Github Pages to work
  // TODO: Maybe there is some redirecting available in pages to make this unnecessary
  { path: "**", component: PlayersPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
