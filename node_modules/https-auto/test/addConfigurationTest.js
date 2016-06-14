/**
 * Created by ctalmacel on 8/24/15.
 */


var autoBootHttps =  require("../lib/AutoBootHttps.js");

autoBootHttps.getOrganizationName('./tmp');
autoBootHttps.getConfigByName('./tmp','docker',console.log);