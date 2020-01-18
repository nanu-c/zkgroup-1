// Generated by zkgroup/codegen/codegen.py - do not edit
package org.signal.zkgroup.auth;

import java.security.SecureRandom;
import java.util.UUID;
import org.signal.zkgroup.InvalidInputException;
import org.signal.zkgroup.ServerPublicParams;
import org.signal.zkgroup.VerificationFailedException;
import org.signal.zkgroup.ZkGroupError;
import org.signal.zkgroup.groups.GroupSecretParams;
import org.signal.zkgroup.internal.Native;
import org.signal.zkgroup.util.UUIDUtil;

public class ClientZkAuthOperations {

  private final ServerPublicParams serverPublicParams;

  public ClientZkAuthOperations(ServerPublicParams serverPublicParams) {
    this.serverPublicParams = serverPublicParams;
  }

  public AuthCredential receiveAuthCredential(UUID uuid, int redemptionTime, AuthCredentialResponse authCredentialResponse) throws VerificationFailedException {
    byte[] newContents = new byte[AuthCredential.SIZE];

    int ffi_return = Native.serverPublicParamsReceiveAuthCredentialJNI(serverPublicParams.getInternalContentsForJNI(), UUIDUtil.serialize(uuid), redemptionTime, authCredentialResponse.getInternalContentsForJNI(), newContents);
    if (ffi_return == Native.FFI_RETURN_INPUT_ERROR) {
      throw new VerificationFailedException();
    }

    if (ffi_return != Native.FFI_RETURN_OK) {
      throw new ZkGroupError("FFI_RETURN!=OK");
    }

    try {
      return new AuthCredential(newContents);
    } catch (InvalidInputException e) {
      throw new AssertionError(e);
    }

  }

  public AuthCredentialPresentation createAuthCredentialPresentation(GroupSecretParams groupSecretParams, AuthCredential authCredential) {
    return createAuthCredentialPresentation(new SecureRandom(), groupSecretParams, authCredential);
  }

  public AuthCredentialPresentation createAuthCredentialPresentation(SecureRandom secureRandom, GroupSecretParams groupSecretParams, AuthCredential authCredential) {
    byte[] newContents = new byte[AuthCredentialPresentation.SIZE];
    byte[] random      = new byte[Native.RANDOM_LENGTH];

    secureRandom.nextBytes(random);

    int ffi_return = Native.serverPublicParamsCreateAuthCredentialPresentationDeterministicJNI(serverPublicParams.getInternalContentsForJNI(), random, groupSecretParams.getInternalContentsForJNI(), authCredential.getInternalContentsForJNI(), newContents);

    if (ffi_return != Native.FFI_RETURN_OK) {
      throw new ZkGroupError("FFI_RETURN!=OK");
    }

    try {
      return new AuthCredentialPresentation(newContents);
    } catch (InvalidInputException e) {
      throw new AssertionError(e);
    }

  }

}
