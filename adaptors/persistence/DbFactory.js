/**********************************************************************************************
 * Export
 **********************************************************************************************/
exports.getDbAdapter = getDbAdapter;


/**********************************************************************************************
 * Vars
 **********************************************************************************************/
var Sequelize = require("sequelize");


/**********************************************************************************************
 * Functions
 **********************************************************************************************/
function getDbAdapter(config) {
    return new Sequelize(config.database, config.username, config.password, {
        // custom host; default: localhost
        host: config.host,

        // custom port; default: 3306
        port: config.port,

        // custom protocol
        // - default: 'tcp'
        // - added in: v1.5.0
        // - postgres only, useful for heroku
        protocol: 'tcp',

        // disable logging; default: console.log
        logging: false,

        // max concurrent database requests; default: 50
        maxConcurrentQueries: 100,

        // the sql dialect of the database
        // - default is 'mysql'
        // - currently supported: 'mysql', 'sqlite', 'postgres'
        dialect: 'mysql',

        // the storage engine for sqlite
        // - default ':memory:'
        storage: 'path/to/database.sqlite',

        // disable inserting undefined values as NULL
        // - default: false
        omitNull: false,

        // Specify options, which are used when sequelize.define is called.
        // The following example:
        //   define: {timestamps: false}
        // is basically the same as:
        //   sequelize.define(name, attributes, { timestamps: false })
        // so defining the timestamps for each model will be not necessary
        // Below you can see the possible keys for settings. All of them are explained on this page
        define: {
            underscored: false,
            freezeTableName: false,
            syncOnAssociation: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
            timestamps: true
        },

        // similiar for sync: you can define this to always force sync for models
        sync: { force: true },

        // sync after each association (see below). If set to false, you need to sync manually after setting all associations. Default: true
        syncOnAssociation: true,

        // use pooling in order to reduce db connection overload and to increase speed
        // currently only for mysql and postgresql (since v1.5.0)
        pool: { maxConnections: 10, maxIdleTime: 30}
    })
}
