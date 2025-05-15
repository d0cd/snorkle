Run `make run` to install and spawn the oracle and gateway.

The gateway will listen at http://0.0.0.0:3000 and has the following API endpoints:

* `status`: noop. only used for testing
* `submit`: generates a new submission to the oraclei
* `info`: Returns the report

## Testing

* Launch the oracle with `make run`
* Issue a new request usign `./request.sh {game_id}` where game_id is the id used in the score API
