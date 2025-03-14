/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';
import {InvalidBananaInBoxCheck} from '../../../src/template_checks/invalid_banana_in_box/index';

runInEachFileSystem(() => {
  describe('TemplateChecks', () => {
    it('should produce invalid banana in a box warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<div ([notARealThing])="var1"> </div>',
        },
        source: 'export class TestCmp { var1: string = "text"; }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [new InvalidBananaInBoxCheck()]);
      const diags = extendedTemplateChecker.getExtendedTemplateDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ErrorCode.INVALID_BANANA_IN_BOX);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('([notARealThing])="var1"');
    });

    it('should not produce invalid banana in a box warning if written correctly', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<div [(notARealThing)]="var1"> </div>',
        },
        source: 'export class TestCmp { var1: string = "text"; }'
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [new InvalidBananaInBoxCheck()]);
      const diags = extendedTemplateChecker.getExtendedTemplateDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce invalid banana in a box warning with bracket in the middle of the name',
       () => {
         const fileName = absoluteFrom('/main.ts');
         const {program, templateTypeChecker} = setup([{
           fileName,
           templates: {
             'TestCmp': '<div (not[AReal]Thing)="var1"> </div>',
           },
           source: 'export class TestCmp { var1: string = "text"; }'
         }]);
         const sf = getSourceFileOrError(program, fileName);
         const component = getClass(sf, 'TestCmp');
         const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
             templateTypeChecker, program.getTypeChecker(), [new InvalidBananaInBoxCheck()]);
         const diags =
             extendedTemplateChecker.getExtendedTemplateDiagnosticsForComponent(component);
         expect(diags.length).toBe(0);
       });

    it('should produce invalid banana in a box warnings for *ngIf and ng-template', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': `<div> 
             <div *ngIf="false" ([notARealThing])="var1"> </div>
             <ng-template #elseBlock ([notARealThing2])="var1">Content to render when condition is false.</ng-template>
           </div>`,
        },
        source: `export class TestCmp { 
           var1: string = "text";
         }`
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [new InvalidBananaInBoxCheck()]);
      const diags = extendedTemplateChecker.getExtendedTemplateDiagnosticsForComponent(component);
      expect(diags.length).toBe(2);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ErrorCode.INVALID_BANANA_IN_BOX);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('([notARealThing])="var1"');
      expect(diags[1].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[1].code).toBe(ErrorCode.INVALID_BANANA_IN_BOX);
      expect(getSourceCodeForDiagnostic(diags[1])).toBe('([notARealThing2])="var1"');
    });
  });
});
