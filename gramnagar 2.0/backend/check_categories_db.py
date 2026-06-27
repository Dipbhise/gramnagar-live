import sqlite3

conn = sqlite3.connect('gramnagar.db')
cursor = conn.cursor()

cursor.execute('SELECT id, title, category FROM notifications')
results = cursor.fetchall()

print('Notifications with categories:')
for r in results:
    print(f'ID: {r[0]}, Title: {r[1]}, Category: {r[2]}')

conn.close()