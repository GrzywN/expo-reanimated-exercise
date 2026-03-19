setup:
	@npm run install
	@npm run prepare

dev:
	@npm run start

dev-android:
	@npm run android

dev-ios:
	@npm run ios

format:
	@npm run format

lint:
	@npm run lint

typecheck:
	@npm run typecheck

test:
	@npm run test

precommit:
	@$(MAKE) format
	@$(MAKE) lint
	@$(MAKE) typecheck
	@$(MAKE) test

clean:
	@npm run clean
	@rm node_modules/
