Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
If Not fso.FileExists(dir & "\Trojan.exe") Then
    MsgBox "Trojan.exe nao encontrado nesta pasta.", 16, "Trojan"
    WScript.Quit 1
End If
shell.Run """" & dir & "\Trojan.exe""", 0, False
