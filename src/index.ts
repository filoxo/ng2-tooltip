import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tooltip } from './tooltip.directive';
import { TooltipContent } from './tooltip-content.component';

export * from './tooltip.directive';
export * from './tooltip-content.component';

@NgModule({
    imports: [ CommonModule ],
    declarations: [ Tooltip, TooltipContent ],
    exports: [ Tooltip, TooltipContent ],
    entryComponents: [ TooltipContent ]
})
export class TooltipModule {}