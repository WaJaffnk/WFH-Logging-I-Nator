
FIX STUPID PAT error:

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch API/.env' \
  --prune-empty --tag-name-filter cat -- --all

  git push --force --all
git push --force --tags

