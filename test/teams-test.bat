cd ..
cross-env CI=true START_SERVER_AND_TEST_INSECURE=1 start-server-and-test ci:coverage:serve https://127.0.0.1:53000 ci:coverage:teams:run
cd test