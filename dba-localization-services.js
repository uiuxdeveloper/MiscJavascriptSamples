/*
 * DBA_MODULE - Localization DB Initialization - Services
 *
 * Author: Curtis M. Janczak
 *
 */
	DBA_MODULE.factory(

		"$LOCALIZATION",
		
		[
			'$q', '$DBA', '$cordovaFile', '$cordovaSQLite',

			function( $q, $DBA, $cordovaFile, $cordovaSQLite ) {
				/* Private */
					var 
						deferredData = null,
						defaultLanguage = "en";
					//
					//
					//
					//
					// Initialize DB
						function initDB( dbName, lang ){
							var db = $cordovaSQLite.openDB( dbName );
												
							// assemble query for localization.db
							var query = "SELECT key, label, label2, url, validateMsg FROM " + lang
							
							// query db through DBA service
							$DBA.query( db, query )
								.then( function( result ){
									console.log( 'data is serialized' );

									serializeData( result );
								});
						}
					// END: Initialize DB
					//
					//
					//
					//
					// Serialize Data
						function serializeData( result ){
							var output = {};

							for( var i=0; i < result.rows.length; i++ ){
								var data = result.rows.item(i);

								output[ data.key ] = {
									'label': data.label,
									'label2': data.label2,
									'url': data.url,
									'validateMsg': data.validateMsg
								}
							}

							deferredData.resolve( output );
						}
					// END: Serialize Date
				/* END: Private */
				//
				//
				//
				//
				/* Public */
					var localization = {};
					//
					//
					//
					//
					// Methods
						// Select All
							localization.getData = function( lang ){

								deferredData = $q.defer();

								lang = typeof lang == "undefined" ? defaultLanguage : lang;
								var dbName = "localization.sqlite";

								window.plugins.sqlDB.copy( 
									dbName, 
									function(){
										initDB( dbName, lang );
									}, function( err ){
										console.log( err );
									}
								);

								return deferredData.promise;
							}
						// END: Select All
					// END: Methods
				// END: Public
				//
				//
				//
				//
				return localization;

			}
		]
	);
/* END: DBA_MODULE - Localization DB Initialization - Services */
