import { Component, Input, AfterViewInit, ElementRef, ChangeDetectorRef } from '@angular/core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

@Component({
    selector: 'tooltip-content',
    template: `
<div class="tooltip {{ placement }}"
     [style.top]="top + 'px'"
     [style.left]="left + 'px'"
     [class.in]="isIn"
     [class.fade]="isFade"
     [attr.aria-expanded]="isFade"
     role="tooltip">
    <div class="tooltip-arrow"></div> 
    <div class="tooltip-inner">
        <ng-content></ng-content>
        {{ content }}
    </div> 
</div>
`,
    styleUrls: ['./tooltip.css']
})
export class TooltipContent implements AfterViewInit {

    // -------------------------------------------------------------------------
    // Inputs / Outputs 
    // -------------------------------------------------------------------------

    @Input() hostElement: HTMLElement;
    @Input() content: string;
    @Input() placement: TooltipPosition = 'bottom';
    @Input() animation: boolean = true;

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    top: number = -100000;
    left: number = -100000;
    isIn: boolean = false;
    isFade: boolean = false;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private element: ElementRef,
                private cdr: ChangeDetectorRef) {
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    ngAfterViewInit(): void {
        this.show();
        this.cdr.detectChanges();
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    
    show(): void {
        if (!this.hostElement)
            return;

        const p = this.positionElements(this.hostElement, this.element.nativeElement.children[0], this.placement);
        this.top = p.top;
        this.left = p.left;
        this.isIn = true;
        if (this.animation)
            this.isFade = true;
    }

    hide(): void {
        this.top = -100000;
        this.left = -100000;
        this.isIn = true;
        if (this.animation)
            this.isFade = false;
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private positionElements(hostEl: HTMLElement, targetEl: HTMLElement, positionStr: string, appendToBody: boolean = false): { top: number, left: number } {
        const [ position, alignment = 'center' ] = positionStr.split('-');
        const { left, width, top, height } = appendToBody ? this.offset(hostEl) : this.position(hostEl);
        const { offsetWidth, offsetHeight } = targetEl;
        const shiftWidth: any = {
            center: () => left + width / 2 - offsetWidth / 2,
            left: () => left,
            right: () => left + width
        };

        let shiftHeight: any = {
            center: () => top + height / 2 - offsetHeight / 2,
            top: () => top,
            bottom: () => top + height
        };

        let targetElPos: { top: number, left: number };
        switch (position) {
            case 'right':
                targetElPos = {
                    top: shiftHeight[alignment](),
                    left: shiftWidth[position]()
                };
                break;
            
            case 'left':
                targetElPos = {
                    top: shiftHeight[alignment](),
                    left: left - offsetWidth
                };
                break;
            
            case 'bottom':
                targetElPos = {
                    top: shiftHeight[position](),
                    left: shiftWidth[alignment]()
                };
                break;
            
            default:
                targetElPos = {
                    top: top - offsetHeight,
                    left: shiftWidth[alignment]()
                };
                break;
        }

        return targetElPos;
    }

    private position(nativeEl: HTMLElement): { width: number, height: number, top: number, left: number } {
        let offsetParentBCR = { top: 0, left: 0 };
        const elBCR = this.offset(nativeEl);
        const offsetParentEl = this.parentOffsetEl(nativeEl);
        if (offsetParentEl !== window.document) {
            offsetParentBCR = this.offset(offsetParentEl);
            offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
            offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        const boundingClientRect = nativeEl.getBoundingClientRect();
        return {
            width: boundingClientRect.width || nativeEl.offsetWidth,
            height: boundingClientRect.height || nativeEl.offsetHeight,
            top: elBCR.top - offsetParentBCR.top,
            left: elBCR.left - offsetParentBCR.left
        };
    }

    private offset(nativeEl:any): { width: number, height: number, top: number, left: number } {
        const boundingClientRect = nativeEl.getBoundingClientRect();
        return {
            width: boundingClientRect.width || nativeEl.offsetWidth,
            height: boundingClientRect.height || nativeEl.offsetHeight,
            top: boundingClientRect.top + (window.pageYOffset || window.document.documentElement.scrollTop),
            left: boundingClientRect.left + (window.pageXOffset || window.document.documentElement.scrollLeft)
        };
    }

    private getStyle(nativeEl: HTMLElement, cssProp: string): string {
        if ((nativeEl as any).currentStyle) // IE
            return (nativeEl as any).currentStyle[cssProp];

        if (window.getComputedStyle)
            return (window.getComputedStyle(nativeEl) as any)[cssProp];
        
        // finally try and get inline style
        return (nativeEl.style as any)[cssProp];
    }

    private isStaticPositioned(nativeEl: HTMLElement): boolean {
        return (this.getStyle(nativeEl, 'position') || 'static' ) === 'static';
    }

    private parentOffsetEl(nativeEl: HTMLElement): any {
        let offsetParent: any = nativeEl.offsetParent || window.document;
        while (offsetParent && offsetParent !== window.document && this.isStaticPositioned(offsetParent)) {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || window.document;
    }

}