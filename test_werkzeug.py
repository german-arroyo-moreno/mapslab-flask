from werkzeug.security import generate_password_hash, check_password_hash

password = "pbkdf2:sha256:600000$DN75UwXCgrDLZ8Wm$ec4d9687cc75a124eccccb68c15b522d222bf33602daaa3ca5fd191f8b2c3434"
test_hash1 = "pbkdf2:sha256:600000$DN75UwXCgrDLZ8Wm$ec4d9687cc75a124eccccb68c15b522d222bf33602daaa3ca5fd191f8b2c3434"
test_hash2 = "pbkdf2:sha256:600000$a2Ec9UMMMIdBHqWe$8ff67fd7d803dde014952430811a6b0ab61dda35613525ad970dc07dc3ff192e"
test_hash3 = "pbkdf2:sha256:600000$1KA9XzECSuZ7fYUg$5f117857cf78dac0f8afe05f4b5421d24e3bfef3147613944d8b2f3c41620411"
password_hash = generate_password_hash(password)

print('Password original: ', password)
print('Su hash generado ahora: ', password_hash)
print('Su hash con el password generado ahora(siempre True): ', check_password_hash(password_hash, password))
print('Check del test1', check_password_hash(test_hash1, password))
print('Check del test2', check_password_hash(test_hash2, password))
print('Check del test3', check_password_hash(test_hash3, password))



print('PARA PRUEBA: admin2 cuando NO loggeaba daba su check?')
print(check_password_hash("pbkdf2:sha256:600000$sc7DbSSgTJEsi8b8$3e371872c5da7869cbb162bd177e080d5f0a1cab073db5f90607acae8247cfa4", "a"))
print('PARA PRUEBA: admin3 cuando NO  loggeaba daba su check?')
print(check_password_hash("pbkdf2:sha256:600000$Mn1O8XskPEcppsbE$f0b4f5244c3303f2d435c36cb1b9dbb37cf077e24a40270c3b95820ab1cb9551", "3"))


print('PARA PRUEBA: admin2 cuando SÍ loggeaba daba su check?')
print(check_password_hash("pbkdf2:sha256:600000$JkZLfUCZofwsvLtE$3054f7789adac52b2d52b9faebaffa48a7998d448db960c3c4850e700b39f45f", "a"))
print('PARA PRUEBA: admin3 cuando SÍ loggeaba daba su check?')
print(check_password_hash("pbkdf2:sha256:600000$uv9mI2nBYhP5F3yQ$d936262615975f3fec48775dcd56ca5c1fbe1b68bb4f0561b9c40342ea619f51", "3"))


print('OTRA PRUEBA PARA VER SI EL HASH DEL HASH DA TRUE CON LA PASSWD ORIGINAL')
print('password generado de porfinsolucionado con p', check_password_hash('pbkdf2:sha256:600000$89e9YA4YvKdloaM8$123e9a70cdc4bc7ece12268cd37b0b5b1e0e923e211252f2a4f61dc736b8e057', "p"))
hash_del_hash = generate_password_hash('pbkdf2:sha256:600000$89e9YA4YvKdloaM8$123e9a70cdc4bc7ece12268cd37b0b5b1e0e923e211252f2a4f61dc736b8e057')
print('el hash del hash con el pass original (p)', check_password_hash(hash_del_hash, "p"))
print('el hash del hash con el hash', check_password_hash(hash_del_hash, 'pbkdf2:sha256:600000$89e9YA4YvKdloaM8$123e9a70cdc4bc7ece12268cd37b0b5b1e0e923e211252f2a4f61dc736b8e057'))

