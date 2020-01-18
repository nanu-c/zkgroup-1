// Generated by zkgroup/codegen/codegen.py - do not edit
package org.signal.zkgroup;

import org.signal.zkgroup.internal.ByteArray;

public final class NotarySignature extends ByteArray {

  public static final int SIZE = 64;

  public NotarySignature(byte[] contents) throws InvalidInputException {
    super(contents, SIZE);
  }

  public byte[] serialize() {
    return contents.clone();
  }

}
