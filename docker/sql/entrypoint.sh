#!/bin/bash
set -e

INIT_SCRIPT="/usr/src/app/init.sql"
SQLCMD="/opt/mssql-tools18/bin/sqlcmd"

# Démarrer SQL Server en arrière-plan
/opt/mssql/bin/sqlservr &
SQL_PID=$!

echo "[init] Attente du démarrage de SQL Server..."
for i in $(seq 1 30); do
    if $SQLCMD -S localhost -U sa -P "$SA_PASSWORD" -Q "SELECT 1" -b -No > /dev/null 2>&1; then
        echo "[init] SQL Server prêt (tentative $i)."
        break
    fi
    echo "[init] Tentative $i/30 — nouvelle tentative dans 5s..."
    sleep 5
done

echo "[init] Exécution du script d'initialisation..."
$SQLCMD -S localhost -U sa -P "$SA_PASSWORD" -i "$INIT_SCRIPT" -No
echo "[init] Base de données initialisée avec succès."

# Garder SQL Server au premier plan
wait $SQL_PID
