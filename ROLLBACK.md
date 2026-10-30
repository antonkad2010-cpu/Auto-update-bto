# Откат публикации 2026-10-30

Предыдущая версия сохранена в GitHub-ветке
`backup/before-client-review-20261030-045856`, коммит
`9e1bf97589a9e7df45e6ef844fe435f7e4ae3b39`.
Эта ветка содержит весь прежний проект, включая прежний `dist/game.modded.js`.
Выпуск с изменениями отмечен тегом `release/client-review-20261030-045856`.

Полный откат выполняется новым коммитом без переписывания истории.
В чистом рабочем дереве:

```bash
git fetch origin --tags
git switch main
git pull --ff-only origin main
git revert --no-edit release/client-review-20261030-045856
git push origin main
```

Если после выпуска те же строки менялись другими коммитами, Git может
потребовать разрешить конфликт. Резервная ветка остаётся источником
предыдущего содержимого; `git push --force` для отката не требуется.

Чтобы вернуть только три удалённые проверки, сохранив диагностику,
исправления клавиш и отключение повторного входа после серверной смерти,
установить `enabled: false` в `patches/client-check-policy.json` и отправить
этот файл новым коммитом в `main`. Workflow пересоберёт стабильный файл
после успешной проверки текущего клиента. Для немедленной ручной пересборки:

```bash
python3 tools/watch_game.py --once
cp build/watch/game.modded.js dist/game.modded.js
git add patches/client-check-policy.json dist/game.modded.js
git commit -m "Restore native client checks"
git push origin main
```

Копировать результат следует только при успешном завершении команды
сборки; при ошибке существующий файл может относиться к старой версии.
