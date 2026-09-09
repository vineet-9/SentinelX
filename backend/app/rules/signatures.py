SUSPICIOUS_EXTENSIONS = {
    ".exe",
    ".dll",
    ".bat",
    ".cmd",
    ".vbs",
    ".scr",
    ".ps1",
    ".js",
    ".jar",
}

SUSPICIOUS_KEYWORDS = [
    b"powershell",
    b"cmd.exe",
    b"Invoke-WebRequest",
    b"DownloadString",
    b"CreateRemoteThread",
    b"VirtualAlloc",
    b"WriteProcessMemory",
    b"Mimikatz",
    b"meterpreter",
    b"reverse_tcp",
]