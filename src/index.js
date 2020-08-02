/**
 * Copyright 2020 Viero, Inc.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

import { EventTarget } from 'event-target-shim';
import { VieroError } from '@viero/common/error';

export class VieroRecorder extends EventTarget {
  constructor(splitInterval, options) {
    super();
    this._recorder = null;
    this._splitInterval = splitInterval;
    this._options = options;
    this._onDataAvailableProxy = this._onDataAvailable.bind(this);
  }

  start(stream) {
    if (this._recorder) {
      throw new VieroError('VieroRecorder', 699688);
    }
    this._recorder = new MediaRecorder(stream, this._options); // ?? API
    this._recorder.addEventListener('dataavailable', this._onDataAvailableProxy);
    this._recorder.start(this._splitInterval);
  }

  stop() {
    if (!this._recorder) {
      throw new VieroError('VieroRecorder', 188805);
    }
    this._recorder.stop();
    this._recorder.removeEventListener('dataavailable', this._onDataAvailableProxy);
    this._recorder = null;
  }

  _onDataAvailable(evt) {
    this.dispatchEvent(new CustomEvent(VieroRecorder.EVENT.DATA_AVAILABLE, { detail: { blob: evt.data } }));
  }
}

VieroRecorder.EVENT = {
  DATA_AVAILABLE: 'VieroRecorderEventDataAvailable',
};
