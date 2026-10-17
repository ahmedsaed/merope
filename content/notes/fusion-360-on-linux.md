---
title: Installing Fusion 360 on Linux with Bottles
description: A step-by-step install of Autodesk Fusion in a Bottles prefix, with the OpenGL or the DirectX 11 renderer, working sign-in, and the config files to skip most of the setup.
date: 2026-10-17
tags: [linux, wine, bottles, fusion-360]
---

This guide installs Autodesk Fusion (still called Fusion 360 by everyone) in a
[Bottles](https://usebottles.com) prefix on Linux, with a working sign-in, the
Home page and Data Panel, and a 3D viewport on your choice of OpenGL or
DirectX 11.

Most of the setup comes down to three things the defaults get wrong: an old
version of Wine, a DLL that newer Wine ships half-finished, and Chromium's
sandbox. If you just want it working, import one of the config files in
[step 3](#3-create-the-bottle) and follow the rest in order. Each setting is
explained at the end for when something breaks.

<Annotation>
  Tested on Fedora 44, kernel 7.2, GNOME on Wayland, an NVIDIA RTX 3060 with
  driver 615.71.9, Bottles 67.4 from Flathub and Fusion build 2705.1.30.
  Wine moves fast — read every version number here as the one that was tested,
  not the only one that works.
</Annotation>

## Choose a renderer

You can run either. Each needs a different Wine build, so pick one per bottle;
nothing stops you having both.

|                                | OpenGL                     | DirectX 11                    |
| ------------------------------ | -------------------------- | ----------------------------- |
| Runner                         | Kron4ek wine 11.19 staging | Kron4ek wine-proton 11.0-2    |
| Viewport                       | smooth                     | renders, a little less smooth |
| Windows user inside the prefix | your Linux username        | `steamuser`                   |

OpenGL is the safer default. DirectX 11 needs the Proton build of Wine, because
Fusion hands each DirectX frame between two devices through shared textures and
only Proton's Wine supports opening them.

## What you need

| Download                    | Link                                                                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Bottles (Flatpak)           | [flathub.org/apps/com.usebottles.bottles](https://flathub.org/apps/com.usebottles.bottles)                                                |
| Wine 11.19 staging (OpenGL) | [wine-11.19-staging-amd64.tar.xz](https://github.com/Kron4ek/Wine-Builds/releases/download/11.19/wine-11.19-staging-amd64.tar.xz)         |
| wine-proton 11.0-2 (DX11)   | [wine-proton-11.0-2-amd64.tar.xz](https://github.com/Kron4ek/Wine-Builds/releases/download/proton-11.0-2/wine-proton-11.0-2-amd64.tar.xz) |
| Fusion installer            | [Fusion Admin Install.exe](https://dl.appstreaming.autodesk.com/production/installers/Fusion%20Admin%20Install.exe)                       |
| Bottle config, OpenGL       | [fusion-360-opengl.yml](/files/fusion-360-on-linux/fusion-360-opengl.yml)                                                                 |
| Bottle config, DirectX 11   | [fusion-360-directx11.yml](/files/fusion-360-on-linux/fusion-360-directx11.yml)                                                           |
| Sign-in helper              | [fusion-login.sh](/files/fusion-360-on-linux/fusion-login.sh)                                                                             |

The Wine builds come from [Kron4ek/Wine-Builds](https://github.com/Kron4ek/Wine-Builds/releases),
which packages upstream Wine and Valve's Proton Wine as portable tarballs. You
also need an Autodesk account; the free
[personal-use licence](https://www.autodesk.com/products/fusion-360/personal)
works.

Bottles installs the rest itself: [DXVK](https://github.com/doitsujin/dxvk),
[vkd3d-proton](https://github.com/HansKristian-Work/vkd3d-proton), and the
fonts, WebView2 and other Windows components listed in the config files.

## 1. Install Bottles

```sh
flatpak install flathub com.usebottles.bottles
```

Open it once so it creates its data folders, then quit.

## 2. Add the Wine runner

Bottles' runner list does not include Kron4ek's builds, but it treats any folder
in its runners directory as a runner. Extract the one you chose there:

```sh
runners=~/.var/app/com.usebottles.bottles/data/bottles/runners

# OpenGL
curl -L https://github.com/Kron4ek/Wine-Builds/releases/download/11.19/wine-11.19-staging-amd64.tar.xz | tar -xJ -C "$runners"
mv "$runners/wine-11.19-staging-amd64" "$runners/kron4ek-wine-11.19-staging-amd64"

# DirectX 11
curl -L https://github.com/Kron4ek/Wine-Builds/releases/download/proton-11.0-2/wine-proton-11.0-2-amd64.tar.xz | tar -xJ -C "$runners"
mv "$runners/wine-proton-11.0-2-amd64" "$runners/kron4ek-wine-proton-11.0-2-amd64"
```

The folder names matter: the config files refer to the runner by exactly these
names. Start Bottles and check the runner appears under **Preferences →
Runners**.

{/* SCREENSHOT runners.png: Bottles → Preferences → Runners, showing the Kron4ek runner(s). Replace this comment with ![The Kron4ek runners in Bottles' runner list](/files/fusion-360-on-linux/runners.png) */}

## 3. Create the bottle

The quick way is to import a config file. In Bottles, open the main menu →
**Import** → **Import Configuration**, and choose
[fusion-360-opengl.yml](/files/fusion-360-on-linux/fusion-360-opengl.yml) or
[fusion-360-directx11.yml](/files/fusion-360-on-linux/fusion-360-directx11.yml).
Bottles creates the bottle, installs DXVK and vkd3d-proton, and installs the
twenty Windows dependencies in the file. That takes a while.

{/* SCREENSHOT import.png: the Import menu with "Import Configuration". Replace this comment with ![Importing a configuration backup](/files/fusion-360-on-linux/import.png) */}

<Annotation>
  If the runner named in the file is not installed, Bottles quietly creates the
  bottle with its newest runner instead — and the sign-in will not work. Check
  the runner in the bottle's settings after importing.
</Annotation>

To set it up by hand instead, create an **Application** bottle and set:

| Where in Bottles                 | Setting                                                                |
| -------------------------------- | ---------------------------------------------------------------------- |
| Settings → Runner                | the runner from step 2                                                 |
| Settings → DXVK / VKD3D          | on, dxvk 3.1.1 / vkd3d-proton 3.0.1                                    |
| Settings → DLL Overrides         | `bcp47langs` → Disabled                                                |
| Settings → Environment Variables | `QTWEBENGINE_DISABLE_SANDBOX` = `1`                                    |
|                                  | `QTWEBENGINE_CHROMIUM_FLAGS` = `--no-sandbox`                          |
| Settings → Use discrete graphics | on, if the computer has two GPUs                                       |
| Dependencies                     | `allfonts`, `webview2`, `msxml6`, `atmlib`, `d3dx11`, `d3dcompiler_42` |

{/* SCREENSHOT bottle-settings.png: the bottle's settings page with runner, DXVK and VKD3D. Replace this comment with ![The bottle's settings](/files/fusion-360-on-linux/bottle-settings.png) */}

## 4. Install Fusion

Download [Fusion Admin Install.exe](https://dl.appstreaming.autodesk.com/production/installers/Fusion%20Admin%20Install.exe),
then in the bottle choose **Run Executable** and pick it.

The admin installer runs quietly: there may be no window at all while it
downloads several gigabytes. It is done when this folder holds a
`FusionLauncher.exe` and a build folder with `Fusion360.exe` in it:

```
<bottle>/drive_c/Program Files/Autodesk/webdeploy/production/
```

`<bottle>` is the bottle's folder — **Browse C:/ drive** in Bottles opens it.

## 5. Add Fusion to the bottle's programs

The installer leaves a desktop shortcut, and Bottles may offer to add it as a
program. **Don't launch Fusion through the shortcut** — the current build
crashes on start when opened via a `.lnk`.

Instead, **Add Shortcuts** and pick the launcher directly:

```
<bottle>/drive_c/Program Files/Autodesk/webdeploy/production/<launcher-folder>/FusionLauncher.exe
```

There are two folders under `production`, and **both** contain a
`FusionLauncher.exe`. `<launcher-folder>` is the one where it sits next to
`FusionLauncher.exe.ini` (and there is no `Fusion360.exe`). The copy in the
build folder fails with "Configuration file … FusionLauncher.exe.ini is missing
or incomplete". Leave the program's launch arguments empty.

The launcher always starts the current build, so this survives Fusion updates.
The build folder beside it is named after a hash that changes with every update,
so never point anything at that.

{/* SCREENSHOT program.png: the bottle's Programs list with Autodesk Fusion pointing at FusionLauncher.exe. Replace this comment with ![Fusion in the bottle's program list](/files/fusion-360-on-linux/program.png) */}

## 6. Sign in

Launch Fusion from Bottles and click **Sign in**. Your normal browser opens the
Autodesk sign-in page. Sign in there; at the end the browser tries to open a
link beginning `adskidmgr:/login?code=`. Copy that link.

Fusion is waiting for its identity manager to receive the link, and it has to
arrive in the same bottle Fusion is running in. The
[sign-in helper](/files/fusion-360-on-linux/fusion-login.sh) finds it for you:

```sh
chmod +x fusion-login.sh
./fusion-login.sh 'adskidmgr:/login?code=…&state=…' 'Fusion 360'
```

The second argument is the bottle's name as Bottles shows it. The code expires
within minutes, so run it straight after signing in. Fusion's Home page fills in
with your designs a few seconds later.

{/* SCREENSHOT signed-in.png: Fusion's Home page after signing in, showing recent designs. Replace this comment with ![Fusion's Home page after sign-in](/files/fusion-360-on-linux/signed-in.png) */}

<Annotation>
  Without the helper: run `AdskIdentityManager.exe` from the newest build
  folder's `Autodesk Identity Manager` subfolder through the bottle's **Run
  Executable**, with the link as its argument. A program entry for it works too,
  but it points into the build folder, so it breaks on every Fusion update.
</Annotation>

## 7. Set the graphics preferences

In Fusion, open **Preferences → General**, then **Compatibility &
Troubleshooting**:

| Fusion preference                   | OpenGL bottle | DirectX 11 bottle |
| ----------------------------------- | ------------- | ----------------- |
| General → Graphics driver           | OpenGL        | DirectX 11        |
| Qt Rendering Hardware Interface API | OpenGL        | D3D11             |
| Chromium Graphics Backend           | `gles`        | Automatic         |

Quit with **File → Exit** and launch again — the renderer only changes after a
restart.

{/* SCREENSHOT preferences.png: Preferences → General with the Graphics driver dropdown. Replace this comment with ![Fusion's graphics preferences](/files/fusion-360-on-linux/preferences.png) */}

## 8. Take a snapshot

In the bottle, open **Snapshots** and create one. If a later Fusion update or a
settings experiment breaks something, restore it from there.

That is the install. The rest of this page is for when something goes wrong.

## Troubleshooting

**Clicking Sign in opens nothing, and console windows flash on and off.** The
bottle is on an older runner. Wine before 11 crashes on the sign-in URL — see
[why below](#why-the-runner). Check the bottle's runner.

**The "Signing in" window stays blank, with no Sign in button.** Fusion cannot
draw to its window on the GPU the bottle uses. On a computer with two GPUs, turn
on **Use discrete graphics** in the bottle's settings so Fusion renders on the
card your monitor is plugged into.

**Sign-in finishes in the browser but Fusion stays signed out.** The link went to
a different bottle, or the code expired. Run the helper again with the right
bottle name, after a fresh sign-in.

**Fusion opens the "Fusion Service Utility" with Launch greyed out.** Fusion
counts sessions that did not close cleanly, and after several it offers repair
instead of starting. Close it, and with Fusion not running, reset the counters:

```sh
f=$(ls "<bottle>"/drive_c/users/*/AppData/Roaming/Autodesk/"Autodesk Fusion 360"/*/CEROption.xml | head -n 1)
iconv -f UTF-16 -t UTF-8 "$f" \
  | sed -E 's#<(SessionStartCount|SessionCleanCloseCount)>[0-9]+<#<\1>1<#' \
  | iconv -f UTF-8 -t UTF-16 > "$f.new" && mv "$f.new" "$f"
```

**Clicks do nothing on part of the screen, or memory fills up.** A Fusion you
closed is still running with an invisible window. Check for leftovers after
every close, and end them:

```sh
pgrep -af Fusion360.exe
flatpak run --command=bottles-cli com.usebottles.bottles stop -b 'Fusion 360'
```

**A launch fails right after switching runners.** Every process from the old
runner has to be gone first; the stop command above does it.

**Changes to the bottle keep undoing themselves.** Bottles writes its settings
back to the bottle's `bottle.yml` from memory. If you edit that file by hand,
quit Bottles completely first: `flatpak kill com.usebottles.bottles`.

**The Fusion window collapses to a thin line on a Wayland session.** Turn on the
bottle's **Virtual Desktop** at your screen size, which keeps Fusion inside one
ordinary window.

**The browser and comments panels stay on screen when Fusion is minimised.**
They are separate windows that GNOME does not tie to Fusion's under Wine.
Switching to another workspace and back hides them. Bottles' **Wayland** option
or **Virtual Desktop** may fix it properly; neither is tested yet.

**The viewport is black on DirectX 11, with only highlights and the ViewCube
showing.** The bottle is not on the Proton runner.

**The DirectX 11 bottle starts signed out with default preferences.** Expected:
Proton's Wine names the Windows user `steamuser`, so Fusion starts a fresh
profile. Sign in again and redo step 7.

**Fusion crashes in ways that make no sense, on an install that used to work.**
Check the disk before anything else:
`journalctl -k | grep -i 'medium error'`. Unreadable sectors under Fusion's own
files look exactly like a Wine bug.

**The Snapshots tab is empty after taking a snapshot.** Bottles 67.4 does not
always list them. They are in the bottle's `.fvs2/index.json`.

## What each setting is for

### Why the runner

When you click Sign in, Fusion's identity manager hands a sign-in URL to Wine to
open in your browser. Since Fusion's 2026 updates that URL is about 2,000
characters long — it lists every permission Fusion requests, twice. Wine before
version 11 treats the URL as a file name first, and in that path copies it into
a fixed-size buffer that it overruns. The identity manager crashes before the
browser ever sees the URL.

It reproduces without Fusion at all, which makes checking any runner a one-liner
(`$url` being any 2,000-character URL):

```sh
wine rundll32.exe url.dll,FileProtocolHandler "$url"
```

| Wine build                    | 2,000-character URL |
| ----------------------------- | ------------------- |
| caffe 9.7 (TkG staging 9.7)   | crashes             |
| caffe 10.0 (TkG staging 10.0) | crashes             |
| Kron4ek wine 11.19 staging    | opens               |
| Kron4ek wine-proton 11.0-2    | opens               |

### Why `bcp47langs` is disabled

Wine 10 added a `bcp47langs.dll` that does not implement
`GetUserLanguages`, the one function Autodesk's identity manager calls from it.
The identity manager aborts on startup. With the DLL disabled it is not found at
all, and the identity manager falls back as it did on older Wine.

### Why the Chromium sandbox is off

Fusion's Home page and Data Panel are Qt WebEngine — a bundled Chromium — running
in helper processes. Chromium's sandbox puts each helper on its own isolated
Windows desktop, which Wine cannot create, so the helpers crash and restart in a
loop and the panels stay blank. The sandbox only separates Autodesk's own web
panels from Fusion, inside a Wine prefix that is already a container.

### Why the launch arguments are empty

A widely shared older setup adds launch arguments that force Fusion's bundled
C++ runtime DLLs and disable Autodesk's analytics service. On Wine 9 they were
needed. On Wine 10 and 11 they stop Fusion from starting at all.

### Why DirectX 11 needs Proton

Fusion's DirectX 11 renderer draws the scene on one Direct3D device and passes
each frame to another through shared textures. DXVK can only open those with
support from the Wine underneath, which Valve's Proton Wine has and upstream
Wine does not yet. On upstream Wine every shared texture comes back empty: the
viewport is black, and only what is drawn directly — the ViewCube, hover
highlights — shows up.
