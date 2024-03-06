# `calendar-admin-cli` setup

## 1. Ensure `tsx` globally installed

```sh
# npm, or some alternative
npm i -g tsx
```

## 2. (AWS setup) Calendar Admin IAM user

Terraform for `setup-aws` provisions user called `CalendarAdminUser`

1. Sign in as this user in [AWS console](https://https://console.aws.amazon.com/)
2. Locate the IAM User in `IAM` service
3. Create access keys for `CalendarAdminUser`
4. Store access keys as env variables in a file of your choice

    ```sh
    AWS_ACCESS_KEY_ID=AAAAAAAAAAAAAAAAAAAA
    AWS_ACCESS_KEY_ID=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    ```

5. Store the filepath of the file containing access keys to `AWS_CALENDAR_ADMINISTRATOR_ACCESS_KEYS_FILE`

    ```sh
    AWS_CALENDAR_ADMINISTRATOR_ACCESS_KEYS_FILE=path/to/the/file/with/creds
    ```

The file with credentials is sourced before running the executables (CLI, or admin scripts)

### Note

This is atm ductape solution in regards to permissions - planned refactor to IAM roles in the future, or potential use of [`aws-vault`](https://github.com/99designs/aws-vault)

## 3. `$PATH` adjustments

Adjust your `$PATH` env variable

```sh
# include /bin subdirectory of the repo
export PATH="$PATH:/path/to/the/project/calendar-from-cli/bin"
```

## 4. Go go go

If you get output from following

```sh
which calendar-admin-cli
```

Try running the cli

```sh
calendar-from-cli
```
