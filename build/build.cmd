@echo on
w:
cd \engelman\meister\pie-meister.github.io
pwd

rem git remote add origin https://github.com/iconmeister/iconmeister.github.io.git

set file=elements.pie-meister
set fullsrc=%file%.js
set minsrc=%file%.min.js
set tersrc=%file%.min_save.js
set gzipsrc=%file%.min_save.js.gz

set beauty=
REM set beauty=-b
if exist %gzipsrc% del /q %gzipsrc%
call terser %file%.js --config-file ./build/terser.json %beauty% -o %tersrc%

REM Build application ===================================================================

rem get min_save.js filesize as variable minsize
FOR /F "usebackq" %%A IN ('%tersrc%') DO set minsize=%%~zA

rem create MIN
copy /y %tersrc% %minsrc% > nul

rem goto :end

rem determine GZ size ?todo: add -k (keep) source
call gzip -9 -N -f %tersrc%
rem call gzip -9 -N -k -f -v index.html

rem set filesize to variable gzsize 
FOR /F "usebackq" %%A IN ('%gzipsrc%') DO set gzsize=%%~zA

call gzthermal.exe %gzipsrc%
set pngfile=gzip_analysis.png
del /Q %pngfile%
ren gzthermal-result.png %pngfile%

del /q %gzipsrc%
del /q %tersrc%
call cfonts "%minsize% - %gzsize%" -a center -g red,green

dir

:end