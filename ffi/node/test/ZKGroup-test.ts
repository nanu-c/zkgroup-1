import { assert } from 'chai';
import { toUUID, fromUUID } from '../zkgroup/internal/UUIDUtil';
import FFICompatArray, { FFICompatArrayType } from '../zkgroup/internal/FFICompatArray';

import AssertionError from '../zkgroup/errors/AssertionError';

import ServerSecretParams from '../zkgroup/ServerSecretParams';
import ServerZkAuthOperations from '../zkgroup/auth/ServerZkAuthOperations';
import GroupMasterKey from '../zkgroup/groups/GroupMasterKey';
import GroupSecretParams from '../zkgroup/groups/GroupSecretParams';
import ClientZkAuthOperations from '../zkgroup/auth/ClientZkAuthOperations';
import ClientZkGroupCipher from '../zkgroup/groups/ClientZkGroupCipher';
import ServerZkProfileOperations from '../zkgroup/profiles/ServerZkProfileOperations';
import ClientZkProfileOperations from '../zkgroup/profiles/ClientZkProfileOperations';
import ProfileKey from '../zkgroup/profiles/ProfileKey';
import ProfileKeyVersion from '../zkgroup/profiles/ProfileKeyVersion';

function hexToCompatArray(hex: string) {
  const buffer = Buffer.from(hex, 'hex');
  return new FFICompatArray(buffer);
}
function arrayToCompatArray(array: Array<number>) {
  const buffer = Buffer.from(array);
  return new FFICompatArray(buffer);
}
function assertByteArray(hex: string, actual: FFICompatArrayType) {
  const actualHex = actual.buffer.toString('hex');

  assert.strictEqual(hex, actualHex);
}
function assertArrayEquals(expected: FFICompatArrayType, actual: FFICompatArrayType) {
  const expectedHex = expected.buffer.toString('hex');
  const actualHex = actual.buffer.toString('hex');

  assert.strictEqual(expectedHex, actualHex);
}
function assertArrayNotEquals(expected: FFICompatArrayType, actual: FFICompatArrayType) {
  const expectedHex = expected.buffer.toString('hex');
  const actualHex = actual.buffer.toString('hex');

  assert.notEqual(expectedHex, actualHex);
}
function clone(data: FFICompatArrayType) {
  // Note: we can't relay on Buffer.slice, since it returns a reference to the same
    //   uinderlying memory
  const array = Uint8Array.prototype.slice.call(data.buffer);
  const buffer = Buffer.from(array);
  return new FFICompatArray(buffer);
}

describe('ZKGroup', () => {
  const TEST_ARRAY_16   = hexToCompatArray('000102030405060708090a0b0c0d0e0f');
  const TEST_ARRAY_32   = hexToCompatArray('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
  const TEST_ARRAY_32_1 = hexToCompatArray('6465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f80818283');
  const TEST_ARRAY_32_2 = hexToCompatArray('c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7');
  const TEST_ARRAY_32_3 = arrayToCompatArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
  const TEST_ARRAY_32_4 = arrayToCompatArray([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]);
  const TEST_ARRAY_32_5 = hexToCompatArray('030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122');
  const authPresentationResult = hexToCompatArray('c051a9c14dd980bbc66f30980fb99574093830ba5265f7871f5723a687dc7535ca442d45f9f439c932764613955275d822bd3ab1f29104c0358da29f8315052d7c5f9f3195e5ed27fcaf25564eb3c419da5b0d7e2f4f4baa70c12dc12174e37d50c2a93b803d8c972f12af026ab60d91a4c4ba54842e73073c0b520f2513105a6e72350204c18d686645ca4991ac56a557f1e05f771697fb6aef6d1db72e6325e0d397fb7951fdfa1e3ae328244263d48b4a74de88e54fc8b8427bf56911f04bf28f0ac87f549b33c324b0063913191686b7bbc8724636d91b567cb7543c66394856a70ebc0f09db4892499ce625bdd3fe42e3d8d8012cc50fcf76f58ab5fc3920010000000000002405bffd51b8464339da562bb00efbe2fdf2a39faac890b7ccf2a8f78ee3920347574f11f0ce50370e854660943f28474eae61c089b24deda5d272b6615a7500753a3b54c7d147005b6bf8946e2a2426e6ff22d27f5e8d011b5a226dd8a43c0b94f91314fe0b29a1c885d920251bb4fb72ceb02a3198c20fdb7ce387df2f270ac77f816111da46a6df6db05eaaed026e73f80d5bf09360b857497fe2c25954058b546ca9766f39c5dafe92709a115097271b8dc166033b0d1dc435b62afc50007b6cc6c1dbe21013164e362c14f50921ca2c5b59a1fdf1ea722144a9b57ffc0980adf58c471afbb2f9ceee8b17110a39224001db909e1ae52b89f5b6911d3902fee77c0c13a60fb2265e3f0955a6ceb143f531a9bc75228db420bbd9535f990a2047ffdb43a7b802030e20c50051edcf0fb92178e087fa5e5d1e045b38a01b3af44c192e9ea29581e9c3befd1a10aab20ccd19a6dec3ca0668d887e8f186851e40e20100');
  const profileKeyPresentationResult = hexToCompatArray('30c7b1e8509de165c17e485832a2bbdee52c5646e4380a9e09909343e4abcf5270ad9ba7194965fd629f473c8b56bf28d2cfc46c8a32c4d391b8b195fe8b6441a60435237e987f46d017832528d70b5d675a49ed170029b7d78addffe7d8733f90efce840c498f30e3d63db38cd3e9a63e7cfdfc9223ff9abd46ab490917f93586c5f334666b37e6a6cb970b12f8ff031350dbf53371099520e7a971a0843e11ae4b54716488c13179e54a88157cd29ca5f12ebc62c595ff4244bfc1c0c46c51cc9c19b0256919df2286c174509b43fc1491ad7086400379834617061733d249569523801bfe05d13289996de474e113a391006bab1fe7b78981e9472f1e6f007e076730e40a18affba761c0ccda987b81355a07bf4450855756f06d4bab0d7f5a17a32be08443c8915d6af3a2ccc61e95963db59a6dc085d7de371f1fd9b961a2f54575fa022505567b7565635854ad1d98eecaf0a36941d4e852b249fc6d75c00100000000000021bc08af6fd5a231eea251c31d623b631ff4c1b49cc2e4ff3f821e631df6e70b0b1dacd55c624a3860ba26d6b70e77c5e582c11712e742371ecde369d0de4707c631ddb5d09fb9fd9e0e87c52593dc48c15fcc30c91ccbfc6c8d975c4837bb0d4916fa516dff98025e41c2f1a3488a0cbc2c4be0602b0e45b88cbcf922ee2e0138d0b38260d65b1dcd8a67a59e20278f425ca039245e1a2b151a643d74131001ae283de5e00e175088329490d74e806ec028afb5e2850403511f0c902d803d09edcec172d0affebfa5a79fbcf994dfe7831127a4bca66e28fa52713614206108e8e06b99ab82bb892fff0d469aaa9ef21cd156b7ed18d5650a3c06b641b4350be71a2ce0651f201483f88a5720824a300f828f2e28fc0ed9d84ee8b3cd5650046da25afb30be4ad31405625cece3f9c8493cfdec60c014a8c19d6e8be511e20aaa29e7b6c5c381b86fb3539840be496fe94ad6ae2b6a03402aa19f10a1d5050ad5b3350d4701507433db5ba9c46441d282dfed3ccf782731d15386ccbe29bc0cd7348ff90c1c0c1ab1f3fb8da4c9058ce326adf768cb1fa001f80eeccc2c3b0ef977ffc05da62ee49b4582021eebaff3211e1723576937fcea15f1a709b6600a2047ffdb43a7b802030e20c50051edcf0fb92178e087fa5e5d1e045b38a01b3af44c192e9ea29581e9c3befd1a10aab20ccd19a6dec3ca0668d887e8f186851eea83b972525b228c17deb6a31f7967c077c8f5072402bd25e13ed971b6a0071cb2939112babb9aa2fadaa02d87ef33741297e1514ec583d417f3d490588aca26');

  it('testAuthIntegration', () => {
    const uuid           = toUUID(TEST_ARRAY_16);
    const redemptionTime = 123456;

    // Generate keys (client's are per-group, server's are not)
    // ---

    // SERVER
    const serverSecretParams = ServerSecretParams.generateWithRandom(TEST_ARRAY_32);
    const serverPublicParams = serverSecretParams.getPublicParams();
    const serverZkAuth       = new ServerZkAuthOperations(serverSecretParams);

    // CLIENT
    const masterKey         = new GroupMasterKey(TEST_ARRAY_32_1);
    const groupSecretParams = GroupSecretParams.deriveFromMasterKey(masterKey);

    assertArrayEquals(groupSecretParams.getMasterKey().serialize(), masterKey.serialize());

    const groupPublicParams = groupSecretParams.getPublicParams();

    // SERVER
    // Issue credential
    const authCredentialResponse = serverZkAuth.issueAuthCredentialWithRandom(TEST_ARRAY_32_2, uuid, redemptionTime);

    // CLIENT
    // Receive credential
    const clientZkAuthCipher  = new ClientZkAuthOperations(serverPublicParams);
    const clientZkGroupCipher = new ClientZkGroupCipher   (groupSecretParams );
    const authCredential      = clientZkAuthCipher.receiveAuthCredential(uuid, redemptionTime, authCredentialResponse);

    // Create and decrypt user entry
    const uuidCiphertext = clientZkGroupCipher.encryptUuid(uuid);
    const      plaintext = clientZkGroupCipher.decryptUuid(uuidCiphertext);
    assert.strictEqual(uuid, plaintext);

    // Create presentation
    const presentation = clientZkAuthCipher.createAuthCredentialPresentationWithRandom(TEST_ARRAY_32_5, groupSecretParams, authCredential);

    // Verify presentation
    const uuidCiphertextRecv = presentation.getUuidCiphertext();
    assertArrayEquals(uuidCiphertext.serialize(), uuidCiphertextRecv.serialize());
    assert.strictEqual(presentation.getRedemptionTime(), redemptionTime);
    serverZkAuth.verifyAuthCredentialPresentation(groupPublicParams, presentation);

    assertArrayEquals(presentation.serialize(), authPresentationResult);
  });

  it('testProfileKeyIntegration', () => {

    const uuid           = toUUID(TEST_ARRAY_16);
    const redemptionTime = 1234567;

    // Generate keys (client's are per-group, server's are not)
    // ---

    // SERVER
    const serverSecretParams = ServerSecretParams.generateWithRandom(TEST_ARRAY_32);
    const serverPublicParams = serverSecretParams.getPublicParams();
    const serverZkProfile    = new ServerZkProfileOperations(serverSecretParams);

    // CLIENT
    const masterKey         = new GroupMasterKey(TEST_ARRAY_32_1);
    const groupSecretParams = GroupSecretParams.deriveFromMasterKey(masterKey);

    assertArrayEquals(groupSecretParams.getMasterKey().serialize(), masterKey.serialize());

    const groupPublicParams     = groupSecretParams.getPublicParams();
    const clientZkProfileCipher = new ClientZkProfileOperations(serverPublicParams);

    const profileKey             = new ProfileKey(TEST_ARRAY_16);
    const profileKeyCommitment = profileKey.getCommitment();

    // Create context and request
    const context = clientZkProfileCipher.createProfileKeyCredentialRequestContextWithRandom(TEST_ARRAY_32_3, uuid, profileKey);
    const request = context.getRequest();

    // SERVER
    const response = serverZkProfile.issueProfileKeyCredentialWithRandom(TEST_ARRAY_32_4, request, uuid, profileKeyCommitment);

    // CLIENT
    // Gets stored profile credential
    const clientZkGroupCipher  = new ClientZkGroupCipher(groupSecretParams);
    const profileKeyCredential = clientZkProfileCipher.receiveProfileKeyCredential(context, response);

    // Create encrypted UID and profile key
    const uuidCiphertext = clientZkGroupCipher.encryptUuid(uuid);
    const plaintext      = clientZkGroupCipher.decryptUuid(uuidCiphertext);
    assert.strictEqual(plaintext, uuid);

    const profileKeyCiphertext   = clientZkGroupCipher.encryptProfileKeyWithRandom(TEST_ARRAY_32_4, profileKey);
    const decryptedProfileKey    = clientZkGroupCipher.decryptProfileKey(profileKeyCiphertext);
    assertArrayEquals(profileKey.serialize(), decryptedProfileKey.serialize());

    const presentation = clientZkProfileCipher.createProfileKeyCredentialPresentationWithRandom(TEST_ARRAY_32_5, groupSecretParams, profileKeyCredential);

    assertArrayEquals(presentation.serialize(), profileKeyPresentationResult);

    // Verify presentation
    serverZkProfile.verifyProfileKeyCredentialPresentation(groupPublicParams, presentation);
    const uuidCiphertextRecv = presentation.getUuidCiphertext();
    assertArrayEquals(uuidCiphertext.serialize(), uuidCiphertextRecv.serialize());

    const pkvA = profileKeyCommitment.getProfileKeyVersion();
    const pkvB = profileKey.getProfileKeyVersion();
    assertArrayEquals(pkvA.serialize(), pkvB.serialize());

    const pkvC = new ProfileKeyVersion(pkvA.serialize());
    assertArrayEquals(pkvA.serialize(), pkvC.serialize());
  });

  it('testGroupSignatures', () => {
    const groupSecretParams = GroupSecretParams.generateWithRandom(TEST_ARRAY_32);

    const masterKey         = groupSecretParams.getMasterKey();
    const groupPublicParams = groupSecretParams.getPublicParams();

    const message = TEST_ARRAY_32_1;

    const signature = groupSecretParams.signWithRandom(TEST_ARRAY_32_2, message);
    groupPublicParams.verifySignature(message, signature);

    // assertByteArray('ea39f1687426eadd144d8fcf0e33c43b1e278dbbe0a67c3e60d4ce531bcb5402' +
    //                 'f16b2e587ca19189c8466fa1dcdb77ae12d1b8828781512cd292d0915a72b609', signature.serialize());

    const alteredMessage = clone(message);
    alteredMessage[0] ^= 1;

    assertArrayNotEquals(message, alteredMessage);

    try {
      groupPublicParams.verifySignature(alteredMessage, signature);
      throw new AssertionError('verifySignature should fail!');
    } catch(error) {
      // good
    }
  });

  it('testServerSignatures', () => {
    const serverSecretParams = ServerSecretParams.generateWithRandom(TEST_ARRAY_32);
    const serverPublicParams = serverSecretParams.getPublicParams();

    const message = TEST_ARRAY_32_1;

    const signature = serverSecretParams.signWithRandom(TEST_ARRAY_32_2, message);
    serverPublicParams.verifySignature(message, signature);

    assertByteArray('819c59fcaca7023b13875ef63ef98df314de2a6a56d314f63cb98c234b55f506' +
                    'aff6475d295789c66a11cddec1602ef1c4a24414168fe9ba1036ba286b47ea07', signature.serialize());

    const alteredMessage = clone(message);
    alteredMessage[0] ^= 1;

    assertArrayNotEquals(message, alteredMessage);

    try {
        serverPublicParams.verifySignature(alteredMessage, signature);
        throw new AssertionError('signature validation should have failed!');
    } catch (error) {
      // good
    }
  });

  it('testGroupIdentifier', () => {
    const groupSecretParams = GroupSecretParams.generateWithRandom(TEST_ARRAY_32);
    const groupPublicParams = groupSecretParams.getPublicParams();
    // assertByteArray('31f2c60f86f4c5996e9e2568355591d9', groupPublicParams.getGroupIdentifier().serialize());
  });

  it('testErrors', () => {
    const ckp = new FFICompatArray(GroupSecretParams.SIZE);
    ckp.buffer.fill(-127);

    try {
      const groupSecretParams = new GroupSecretParams(ckp);
    } catch (error) {
      // good
    }
  });

  it('testBlobEncryption', () => {
    const groupSecretParams   = GroupSecretParams.generate();
    const clientZkGroupCipher = new ClientZkGroupCipher(groupSecretParams);

    const plaintext = arrayToCompatArray([0,1,2,3,4]);
    const ciphertext = clientZkGroupCipher.encryptBlob(plaintext);
    const plaintext2 = clientZkGroupCipher.decryptBlob(ciphertext);
    assertArrayEquals(plaintext, plaintext2);
  });
});