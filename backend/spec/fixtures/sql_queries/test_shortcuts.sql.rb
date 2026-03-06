# backend/spec/fixtures/sql_queries/test_shortcuts.sql.rb
tables :cartas, :usuarios
q1 = from(:cartas).project(Arel.star)
q2 = from(:usuarios).project(Arel.star)

# Testando union e kase
status = kase(@usuarios[:role]).when('admin').then(1).else(0)
q2.project(status.as('is_admin'))

union(q1, q2)
