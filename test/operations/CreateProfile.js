'use strict'

const Create  = require('src/operations/Create')
const Profile = require('test/documents/Profile')
const JwtAuthorization = require('src/security/JwtAuthorization')

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwwkLCD+fmGDsGMhX93An
m9cJHMXq+3qOyZj1+LUcnC114hMLQSE85VAZEJMNQ7zv2P8EwvYcmXN78vAKZgP8
sbLWc3pS1xZ7w60AfVTOsXvp497X/IjUOUkeJ51G8uIjMNR8mUyi1RJofkvzesHH
vtwdbD7Nz4hZQDDwHsFXbRR0PdlxrtXRMxMBkWdpKanfYfZz28ZcVxBXOo+hFLAr
2f5YzmMlWAMsfKsCwvBuLqZFp/w/iVUN+MHlq3xpRACNzAWjtPPfUgp0f/1eg9nM
q//6RjrJnhxq00rjkTb/28jz6SZWY+Zosmxc2++WheGVJpGaSJK+RJUx5frgmjm0
hwIDAQAB
-----END PUBLIC KEY-----`

class CreateProfile extends Create(Profile) {
  static get security() {
    return [
      JwtAuthorization.createRequirement(publicKey, 'RS256', payload => {
        const { group } = payload
        return [ 'Administrators' ].includes(group)
      })
    ]
  }
}

module.exports = CreateProfile
