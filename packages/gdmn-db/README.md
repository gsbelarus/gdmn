# gdmn-db

## Install

### Windows
1. Install Git.
2. Install [Firebird](https://www.firebirdsql.org/en/firebird-3-0/) version greater than or equal to 3.0.
3. Add `fbclient.dll` directory to the PATH.
4. Run next commands

    ```bash
    $ npm install --global --production windows-build-tools
    $ npm install --global node-gyp
    $ npm install
    ```

### Mac OS X
1. Install Git.
2. Install [Firebird](https://www.firebirdsql.org/en/firebird-3-0/), [see also](https://www.firebirdsql.org/file/documentation/papers_presentations/html/paper-fb-macosx-install.html)
3. Install Xcode Command Line Tools
4. Run next commands
    ```bash 
    $ ln -s /Library/Frameworks/Firebird.framework/Versions/A/Firebird /usr/local/lib/libfbclient.dylib
    $ npm install
    ```

### Linux
...
