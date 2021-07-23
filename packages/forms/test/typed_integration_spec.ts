/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {expect} from '@angular/platform-browser/testing/src/matchers';

import {AbstractControl, FormArray, FormControl, FormGroup} from '../src/forms';
import {FormState} from '../src/model';

// Used to assert that the value V is assignable to type T.
function assignable<T>(v: T): void{}

// These tests check only the types of strongly typed form controls. They do not validate behavior,
// except where the expected behavior is different according to the provided types.
{
  describe('FormControl', () => {
    it('should work with a simple type', () => {
      const c1 = new FormControl('default');
      assignable<string>(c1.value);
    });
    /*
         NOTE: commenting out these tests for now since they are breaking the build
         it('should reject usages with the wrong type', () => {
           const c = new FormControl('default');
           c.reset(42);                // should be error
           c.setValue(42);             // should be error
           c.patchValue(42);           // should be error
           const v: number = c.value;  // should be error
         });

         it('should reject nullable usages with a simple type', () => {
           const c = new FormControl('default');
           c.reset();           // should be error
           c.reset(null);       // should be error
           c.setValue(null);    // should be error
           c.patchValue(null);  // should be error
           // TODO: check c.value is a string
         });
    */

    it('should allow nullable usages with a nullable type', () => {
      const c = new FormControl<string|null>('default');
      c.value;
      type T = string|null;
      {  // Check that the value of c has type T
        const dest: T = c.value;
        let mut = c.value;
        mut = null! as T;
      }

      c.reset();
      c.reset(null);
      c.setValue(null);
      c.patchValue(null);
      // TODO: check c.value is a string or null
    });
  })

  describe('FormGroup', () => {
    it('should construct simple FormGroups', () => {
      const c1 = new FormControl<string|null>('foo');
      const c2 = new FormControl<string>('foobar');
      const g = new FormGroup({c1: c1, c2: c2});
      g.value;
    });

    it('should construct nested FormGroups with the correct types', () => {
      const c1 = new FormGroup({outer: new FormGroup({inner: new FormControl(42)})});
      assignable<Partial<{outer: Partial<{inner: number}>}>>(c1.value);
    });
  });

  describe('FormArray', () => {
    it('should construct simple arrays of controls', () => {
      const c1 = new FormControl<string>('default');
      // const c2 = new FormControl(42);
      const a = new FormArray([c1]);
      a.controls;
      const at = a.at(0);
    });

    it('should construct nested arrays', () => {
      const c1 = new FormControl<string>('default');
      // const c2 = new FormControl(42);
      const a1 = new FormArray([c1]);
      const a2 = new FormArray([a1]);
      a2.controls;
      const at = a2.at(0);
    });
  });
}