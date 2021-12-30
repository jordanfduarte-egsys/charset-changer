

Essa extensão tem a função de reabrir o arquivo caso o charset configurado no arquivo de configuração "settings.json" no index "file.encoding" seja diferente do identificado. Se for diferente o arquivo é reaberto na codificação correta.


##----------------------REGRAS---------------------------##
Caso o charset seja UTF-8 e foi configurado o projeto como ISO8859-1 o arquivo deve ser reaberto em UTF-8;
Caso o charset seja diferente de UTF-8 o arquivo é reaberto em ISO8859-1;

##----------------------CONDIÇÕES------------------------##
Após a instalação desse plugin, verificar o arquivo settings.json e remover comentários, vírgulas que possivelmente esteja sobrando ou até mesmo a propia identação mal formatada.

##-----------------------ENJOY----------------------------##

:D
