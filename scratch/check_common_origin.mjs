import f2xx1 from '../src/data/profiles/IGLO5/IG5_F2XX1.json' with { type: 'json' };
import f103 from '../src/data/profiles/IGLO5/IG5_F103.json' with { type: 'json' };

const computeOrigin = (profileData) => {
  const frmExt = profileData.profiles.FRM_EXT?.vertices || [];
  const frmInt = profileData.profiles.FRM_INT?.vertices || [];
  const bzd = profileData.profiles.BZD?.vertices || [];
  const sshExt = profileData.profiles.SSH_EXT?.vertices || [];
  const sshInt = profileData.profiles.SSH_INT?.vertices || [];
  const glsExt = profileData.profiles.GLS_EXT?.vertices || [];
  const glsInt = profileData.profiles.GLS_INT?.vertices || [];
  const spacer1 = profileData.profiles.SPACER1?.vertices || profileData.profiles.SPCR?.vertices || [];
  const gskFrmExt = profileData.profiles.GSK_FRM_EXT?.vertices || [];
  const gskSshBtm = profileData.profiles.GSK_SSH_BTM?.vertices || [];
  const gskBzd = profileData.profiles.GSK_BZD?.vertices || [];
  const gskSshExt = profileData.profiles.GSK_SSH_EXT?.vertices || [];

  let minX = Infinity, minY = Infinity;
  const allVerts = [
    ...frmExt,
    ...frmInt,
    ...bzd,
    ...sshExt,
    ...sshInt,
    ...glsExt,
    ...glsInt,
    ...spacer1,
    ...gskFrmExt,
    ...gskSshBtm,
    ...gskBzd,
    ...gskSshExt
  ];
  for (const v of allVerts) {
    if (v.x < minX) minX = v.x;
    if (v.y < minY) minY = v.y;
  }
  return { x: minX, y: minY };
};

console.log("F2XX1 Origin:", computeOrigin(f2xx1));
console.log("F103 Origin :", computeOrigin(f103));
