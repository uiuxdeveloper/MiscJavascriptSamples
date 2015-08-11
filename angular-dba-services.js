/*
 * DBA_MODULE - Services
 *
 * Author: Curtis M. Janczak
 *
 */
 	DBA_MODULE.factory(

		"$DBA",
		
		[
			'$q', '$cordovaSQLite', 

			function( $q, $cordovaSQLite ) {
				//
				//
				//
				//
				/* Private */
					// Execute SQL
						function executeSQL( db, query, q ){
							$cordovaSQLite.execute( db, query, [] )
								.then( function( results ) {
									success( results, q );
								}, function( err ){
									error( err, q );
								});
						}
					// END: Execute SQL
					//
					//
					//
					//
					// Error Response 1
						function error( err, q ){
							console.log( 'error: ' + err.message );

							q.reject( err );
						}
					// END: Error Response 1
					//
					//
					//
					//
					// Success Response
						function success( results, q ){
							q.resolve( results );
						}
					// END: Success Response
				/* END: Private */
				//
				//
				//
				//
				/* Public */
					var dba = {};
					//
					//
					//
					//
					// Methods
						// Query a Database
							dba.query = function( db, query ){

								// create promise
								var q = $q.defer();

								// execute DB Query
								executeSQL( db, query, q );

								// return promise
								return q.promise;
							}
						// END: Query a Database
						//
						//
						//
						//
						// Process a result set
							dba.getAll = function( result ){
								var output = {};

								for( var i=0; i < result.rows.length; i++ ){
									output.push( result.rows.item(i) );
								}

								return output;
							}
						// END: Process a result set
						//
						//
						//
						//
						// Process a single result
							dba.getById = function( result ){
								var output = null;

								output = angular.copy( result.rows.items(0) );

								return output;
							}
						// END: Process a single result
					// END: Methods
				// END: Public
				//
				//
				//
				//
				return dba;

			}
		]
	);
/* END: DBA_MODULE - Services */
