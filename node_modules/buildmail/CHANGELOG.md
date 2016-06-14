# Changelog

## 3.7.0 2016-05-11

  * Bumped dependencies

## 3.6.0 2016-03-25

  * Do not set default transfer encoding for message/* nodes

## 3.5.2 2016-02-29

  * Fixes an issue with long filenames that include unicode and dashes

## 3.5.0 2016-02-11

  * Added new option `textEncoding` to set default encoding for text parts
  * If `textEncoding` is not set then detect preferred encoding from the content value (if mostly ASCII then use Quoted-Printable, otherwise Base64)
  * Do not encode unicode e-mail usernames

## 3.4.1 2016-02-05

  * Fixed `setEnvelope`. Parse proper `from` and `to` addresses from the input instead of storing the input unmodified

## 3.4.0 2016-02-05

  * Added new method `setRaw`
  * Bumped nodemailer-fetch version

## 3.3.2

  * Bumped nodemailer-fetch version

## 3.3.1

  * Fixed an issue with handling `Date` and `References` header

## 3.3.0

  * Added `prepared` option for the value argument of setheader/addHeader methods

## 3.2.0

  * Reverted setHeader array value handling. Pass array as array for setHeader

## 3.1.0

  * Bumped nodemailer-shared and addressparser versions
  * Allow arrays for the `value` argument of `setHeader` (uses the last element in the array) and `addHeader` (adds all values as separate rows)
  * Exposed `messageId` method that generates and returns Message-Id value

## 3.0.1

  * Bumped nodemailer-shared version

## 3.0.0

  * Locked dependency versions
  * Do not silently swallow errors, instead emit an error event for the stream and stop further processing
  * Replaced needle with nodemailer-fetch
  * Replaced jshint with eslint
  * Removed format=flowed support, uses 7bit for short lines and QP for long lines of plaintext ASCII

## v2.0.0 2015-10-06

  * Replaced hyperquest with needle. Bumped major version as needle might behave a little bit different than hyperquest

## v1.3.0 2015-10-05

  * Add non-standard name param to content-type header, otherwise non compliant clients like QQ do not understand file names
  * Bumped libmime version to get emoji support in filenames

## v1.2.5 2015-09-24

  * Fixed a bug where ascii html content was not properly handled
  * Updated buildmail for stricter quoted printable encoding

## v1.2.4 2015-04-15

  * Only use format=flowed with text/plain and not with other text/* stuff

## v1.2.3 2015-04-15

  * Maintenace release, bumped dependency versions

## v1.2.2 2015-04-03

  * Maintenace release, bumped libqp which resolves an endless loop in case of a trailing &lt;CR&gt;

## v1.2.1 2014-09-12

  * Maintenace release, fixed a test and bumped dependency versions

## v1.2.0 2014-09-12

  * Allow functions as transform plugins (the function should create a stream object)

## v1.1.1 2014-08-21

  * Bumped libmime version to handle filenames with spaces properly. Short ascii only names with spaces were left unquoted.

## v1.1.0 2014-07-24

  * Added new method `getAddresses` that returns all used addresses as a structured object
  * Changed version number scheme. Major is now 1 but it is not backwards incopatible with 0.x, as only the scheme changed but not the content
