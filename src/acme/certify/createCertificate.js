const generateRSAKeyPair = require('../../util/generateRSAKeyPair')
const newCertificate = require('./newCertificate')
const generateCSR = require('../../util/generateCSR')
const config = require('../../../config')
const saveFile = require('../../aws/s3/saveFile')

const saveCertificate = (data) => {
  saveFile(
    config['s3-cert-bucket'],
    config['s3-folder'],
    `${data.key}.json`,
    JSON.stringify({
      key: data.keypair,
      cert: data.cert,
      issuerCert: data.issuerCert
    })
  );
  console.log(`About to write PEM files for ${key}..`)
  try {
    saveFile(
      config['s3-cert-bucket'],
      config['s3-folder'],
      `${data.key}.pem`,
      data.cert
    );
    if (certJSON.issuerCert) {
      saveFile(
        config['s3-cert-bucket'],
        config['s3-folder'],
        `${data.key}-chain.pem`,
        data.issuerCert.toString()
      );
    }
    saveFile(
      config['s3-cert-bucket'],
      config['s3-folder'],
      `${data.key}-key.pem`,
      data.keypair.privateKeyPem.toString()
    );
  } catch (e) {
    console.error('Error writing pem files', e)
  }
}

const createCertificate = (certUrl, certInfo, acctKeyPair) => (authorizations) =>
  generateRSAKeyPair()
  .then(domainKeypair =>
    generateCSR(domainKeypair, certInfo.domains)
    .then(newCertificate(acctKeyPair, authorizations, certUrl))
    .then((certData) =>
      saveCertificate({
        key: certInfo.key,
        keypair: domainKeypair,
        cert: certData.cert,
        issuerCert: certData.issuerCert
      })
    )
  )

module.exports = createCertificate
