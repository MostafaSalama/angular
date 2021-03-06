/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as html from '../../src/ml_parser/ast';
import {HtmlParser} from '../../src/ml_parser/html_parser';
import {PRESERVE_WS_ATTR_NAME, removeWhitespaces} from '../../src/ml_parser/html_whitespaces';

import {humanizeDom} from './ast_spec_utils';

export function main() {
  describe('removeWhitespaces', () => {

    function parseAndRemoveWS(template: string): any[] {
      return humanizeDom(removeWhitespaces(new HtmlParser().parse(template, 'TestComp')));
    }

    it('should remove blank text nodes', () => {
      expect(parseAndRemoveWS(' ')).toEqual([]);
      expect(parseAndRemoveWS('\n')).toEqual([]);
      expect(parseAndRemoveWS('\t')).toEqual([]);
      expect(parseAndRemoveWS('    \t    \n ')).toEqual([]);
    });

    it('should remove whitespaces (space, tab, new line) between elements', () => {
      expect(parseAndRemoveWS('<br>  <br>\t<br>\n<br>')).toEqual([
        [html.Element, 'br', 0],
        [html.Element, 'br', 0],
        [html.Element, 'br', 0],
        [html.Element, 'br', 0],
      ]);
    });

    it('should remove whitespaces from child text nodes', () => {
      expect(parseAndRemoveWS('<div><span> </span></div>')).toEqual([
        [html.Element, 'div', 0],
        [html.Element, 'span', 1],
      ]);
    });

    it('should remove whitespaces from the beginning and end of a template', () => {
      expect(parseAndRemoveWS(` <br>\t`)).toEqual([
        [html.Element, 'br', 0],
      ]);
    });

    it('should convert &ngsp; to a space and preserve it', () => {
      expect(parseAndRemoveWS('<div><span>foo</span>&ngsp;<span>bar</span></div>')).toEqual([
        [html.Element, 'div', 0],
        [html.Element, 'span', 1],
        [html.Text, 'foo', 2],
        [html.Text, ' ', 1],
        [html.Element, 'span', 1],
        [html.Text, 'bar', 2],
      ]);
    });

    it('should replace multiple whitespaces with one space', () => {
      expect(parseAndRemoveWS('\n\n\nfoo\t\t\t')).toEqual([[html.Text, ' foo ', 0]]);
      expect(parseAndRemoveWS('   \n foo  \t ')).toEqual([[html.Text, ' foo ', 0]]);
    });

    it('should not replace single tab and newline with spaces', () => {
      expect(parseAndRemoveWS('\nfoo')).toEqual([[html.Text, '\nfoo', 0]]);
      expect(parseAndRemoveWS('\tfoo')).toEqual([[html.Text, '\tfoo', 0]]);
    });

    it('should preserve single whitespaces between interpolations', () => {
      expect(parseAndRemoveWS(`{{fooExp}} {{barExp}}`)).toEqual([
        [html.Text, '{{fooExp}} {{barExp}}', 0],
      ]);
      expect(parseAndRemoveWS(`{{fooExp}}\t{{barExp}}`)).toEqual([
        [html.Text, '{{fooExp}}\t{{barExp}}', 0],
      ]);
      expect(parseAndRemoveWS(`{{fooExp}}\n{{barExp}}`)).toEqual([
        [html.Text, '{{fooExp}}\n{{barExp}}', 0],
      ]);
    });

    it('should preserve whitespaces around interpolations', () => {
      expect(parseAndRemoveWS(` {{exp}} `)).toEqual([
        [html.Text, ' {{exp}} ', 0],
      ]);
    });

    it('should preserve whitespaces inside <pre> elements', () => {
      expect(parseAndRemoveWS(`<pre><strong>foo</strong>\n<strong>bar</strong></pre>`)).toEqual([
        [html.Element, 'pre', 0],
        [html.Element, 'strong', 1],
        [html.Text, 'foo', 2],
        [html.Text, '\n', 1],
        [html.Element, 'strong', 1],
        [html.Text, 'bar', 2],
      ]);
    });

    it('should skip whitespace trimming in <textarea>', () => {
      expect(parseAndRemoveWS(`<textarea>foo\n\n  bar</textarea>`)).toEqual([
        [html.Element, 'textarea', 0],
        [html.Text, 'foo\n\n  bar', 1],
      ]);
    });

    it(`should preserve whitespaces inside elements annotated with ${PRESERVE_WS_ATTR_NAME}`,
       () => {
         expect(parseAndRemoveWS(`<div ${PRESERVE_WS_ATTR_NAME}><img> <img></div>`)).toEqual([
           [html.Element, 'div', 0],
           [html.Element, 'img', 1],
           [html.Text, ' ', 1],
           [html.Element, 'img', 1],
         ]);
       });
  });
}
