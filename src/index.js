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

    this._splitInterval = splitInterval || 0;
    this._options = options || {};

    this._recorder = null;
    this._onDataAvailableProxy = this._onDataAvailable.bind(this);
  }

  get splitInterval() {
    return this._splitInterval;
  }

  set splitInterval(splitInterval) {
    this._splitInterval = splitInterval;
  }

  get options() {
    return this._options;
  }

  set options(options) {
    this._options = options;
  }

  set stream(stream) {
    this.stop();
    this._stream = stream;
    this.dispatchEvent(new CustomEvent(VieroRecorder.EVENT.STREAM_DID_CHANGE));
  }

  get stream() {
    return this._stream;
  }

  get recording() {
    return !!this._recorder;
  }

  start() {
    if (this._recorder) {
      throw new VieroError('VieroRecorder', 699688);
    }
    if (!this._stream) {
      throw new VieroError('VieroRecorder', 262213);
    }
    this._recorder = new MediaRecorder(this._stream, this._options); // ?? API
    this._recorder.addEventListener('dataavailable', this._onDataAvailableProxy);
    this._recorder.start(this._splitInterval);
    this.dispatchEvent(new CustomEvent(VieroRecorder.EVENT.DID_START));
  }

  stop() {
    if (!this._recorder) {
      return;
    }
    this._recorder.stop();
    this._recorder.removeEventListener('dataavailable', this._onDataAvailableProxy);
    this._recorder = null;
    this.dispatchEvent(new CustomEvent(VieroRecorder.EVENT.DID_STOP));
  }

  _onDataAvailable(evt) {
    this.dispatchEvent(new CustomEvent(VieroRecorder.EVENT.DATA_AVAILABLE, { detail: { blob: evt.data } }));
  }
}

VieroRecorder.EVENT = {
  DID_START: 'VieroRecorderEventDidStart',
  DID_STOP: 'VieroRecorderEventDidEnd',
  STREAM_DID_CHANGE: 'VieroRecorderEventStreamDidChange',
  DATA_AVAILABLE: 'VieroRecorderEventDataAvailable',
};
