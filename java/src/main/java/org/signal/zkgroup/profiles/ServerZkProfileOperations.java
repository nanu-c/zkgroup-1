// Generated by zkgroup/codegen/codegen.py - do not edit
package org.signal.zkgroup.profiles;

import java.security.SecureRandom;
import java.util.UUID;
import org.signal.zkgroup.InvalidInputException;
import org.signal.zkgroup.ServerSecretParams;
import org.signal.zkgroup.VerificationFailedException;
import org.signal.zkgroup.ZkGroupError;
import org.signal.zkgroup.groups.GroupPublicParams;
import org.signal.zkgroup.internal.Native;
import org.signal.zkgroup.util.UUIDUtil;

public class ServerZkProfileOperations {

  private final ServerSecretParams serverSecretParams;

  public ServerZkProfileOperations(ServerSecretParams serverSecretParams) {
    this.serverSecretParams = serverSecretParams;
  }

  public ProfileKeyCredentialResponse issueProfileKeyCredential(ProfileKeyCredentialRequest profileKeyCredentialRequest, UUID uuid, ProfileKeyCommitment profileKeyCommitment) throws VerificationFailedException {
    return issueProfileKeyCredential(new SecureRandom(), profileKeyCredentialRequest, uuid, profileKeyCommitment);
  }

  public ProfileKeyCredentialResponse issueProfileKeyCredential(SecureRandom secureRandom, ProfileKeyCredentialRequest profileKeyCredentialRequest, UUID uuid, ProfileKeyCommitment profileKeyCommitment) throws VerificationFailedException {
    byte[] newContents = new byte[ProfileKeyCredentialResponse.SIZE];
    byte[] random      = new byte[Native.RANDOM_LENGTH];

    secureRandom.nextBytes(random);

    int ffi_return = Native.serverSecretParamsIssueProfileKeyCredentialDeterministicJNI(serverSecretParams.getInternalContentsForJNI(), random, profileKeyCredentialRequest.getInternalContentsForJNI(), UUIDUtil.serialize(uuid), profileKeyCommitment.getInternalContentsForJNI(), newContents);
    if (ffi_return == Native.FFI_RETURN_INPUT_ERROR) {
      throw new VerificationFailedException();
    }

    if (ffi_return != Native.FFI_RETURN_OK) {
      throw new ZkGroupError("FFI_RETURN!=OK");
    }

    try {
      return new ProfileKeyCredentialResponse(newContents);
    } catch (InvalidInputException e) {
      throw new AssertionError(e);
    }

  }

  public void verifyProfileKeyCredentialPresentation(GroupPublicParams groupPublicParams, ProfileKeyCredentialPresentation profileKeyCredentialPresentation) throws VerificationFailedException {
    int ffi_return = Native.serverSecretParamsVerifyProfileKeyCredentialPresentationJNI(serverSecretParams.getInternalContentsForJNI(), groupPublicParams.getInternalContentsForJNI(), profileKeyCredentialPresentation.getInternalContentsForJNI());
    if (ffi_return == Native.FFI_RETURN_INPUT_ERROR) {
      throw new VerificationFailedException();
    }

    if (ffi_return != Native.FFI_RETURN_OK) {
      throw new ZkGroupError("FFI_RETURN!=OK");
    }
  }

}
