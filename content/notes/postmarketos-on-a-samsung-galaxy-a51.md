---
title: Turning a Samsung Galaxy A51 into a Linux server with postmarketOS
description: A step-by-step install of headless postmarketOS on an old Galaxy A51 through TWRP, with SSH, Wi-Fi and Docker, and the five fixes it takes to boot in 2026.
date: 2026-10-22
tags: [linux, postmarketos, android, homelab, docker]
---

This guide installs [postmarketOS](https://postmarketos.org) on a Samsung Galaxy
A51 (SM-A515F) and turns it into a small headless server: no desktop, SSH over
USB and Wi-Fi, a static address on the home network, and Docker running
containers with memory and CPU limits. An old phone makes a good one. It has an eight-core CPU, 4 to 8 GB of RAM depending on the model and 128 GB of
storage, it uses very little power, and its battery doubles as a UPS.

The A51 used to install with the stock postmarketOS tooling. It no longer does.
The device is _archived_ in postmarketOS — nobody maintains it — and several
changes made across the project during 2026 each broke it in a different way: the
kernel no longer builds, the boot image is compressed in a format the kernel
cannot read, and the boot scripts cannot find or mount the root filesystem. The
fixes are five small patches, published with scripts and notes in
[ahmedsaed/pmos-samsung-a51](https://github.com/ahmedsaed/pmos-samsung-a51). Follow the steps in order and you
end up with a working server; each fix is explained at the end, for when
something breaks or for porting them to another phone.

<Annotation>
  Tested on Fedora 44 with pmbootstrap 3.12.1, pmaports `main` at `78e02f37`,
  postmarketos-initramfs 3.12.5, the downstream `linux-samsung-a51` 4.14.113
  kernel built with clang 23.1.3, Docker 29.9.1 and crun 1.30.1. The A51 is on
  the `edge` channel only, which moves daily. Read every version here as the
  one that was tested, not the only one that works.
</Annotation>

## What you end up with

|                 |                                                               |
| --------------- | ------------------------------------------------------------- |
| OS              | postmarketOS edge (Alpine Linux underneath), console only     |
| Init            | OpenRC                                                        |
| Access          | SSH with key login, over USB (`172.16.42.1`) and Wi-Fi        |
| Network         | Wi-Fi with a stable MAC address, DHCP or a static IP          |
| Containers      | Docker and Docker Compose, with crun on cgroup v1             |
| Free for things | about 5 GB of RAM and 100 GB of disk                          |
| Battery         | charging stops at 80%, so a phone plugged in 24/7 lasts       |
| Not working     | a firewall (the kernel has no nf_tables); see the limitations |

## What you need

- A Samsung Galaxy A51, **SM-A515F** (the Exynos 9611 model), with an unlocked
  bootloader and [TWRP](https://twrp.me) installed as the recovery.
- A Linux PC with `git`, `python3`, `sudo` and `adb`
  (`sudo dnf install android-tools` on Fedora).
- A USB cable that carries data.
- About 10 GB of free disk on the PC and an hour, most of it the kernel build.
- The [pmos-samsung-a51](https://github.com/ahmedsaed/pmos-samsung-a51) repository.

Everything on the phone is replaced. postmarketOS goes onto the `userdata`
partition, which is where Android kept your apps and files.

## 1. Set up pmbootstrap

[pmbootstrap](https://docs.postmarketos.org/pmbootstrap/) is postmarketOS's
build tool: it builds packages in Alpine chroots and assembles the image you
install. Clone the repository, and use its directory as pmbootstrap's work
directory so everything stays in one place:

```sh
git clone https://github.com/ahmedsaed/pmos-samsung-a51.git pmos-a51
cd pmos-a51
git clone https://gitlab.postmarketos.org/postmarketOS/pmbootstrap.git
alias pmbootstrap="$PWD/pmbootstrap/pmbootstrap.py"
pmbootstrap init
```

The repository's `.gitignore` ignores everything except its own files, so the
gigabytes pmbootstrap downloads and builds there never show up in `git status`.

`pmbootstrap init` asks a series of questions. Choose **this work directory**
when it asks for one, then answer:

| Prompt                  | Answer              | Why                                                                 |
| ----------------------- | ------------------- | ------------------------------------------------------------------- |
| Channel                 | `edge`              | archived devices only exist on edge                                 |
| Vendor / codename       | `samsung` / `a51`   | accept the warning that the device is archived                      |
| Kernel                  | `linux-samsung-a51` | the only one                                                        |
| User interface          | `console`           | no desktop, but it brings NetworkManager and SSH; `none` lacks both |
| Service manager         | `openrc`            | systemd needs newer kernel features than 4.14 has                   |
| Extra packages          | `htop,nano,chrony`  | anything else you want from the start                               |
| Copy SSH keys           | yes                 | harmless, but see step 7                                            |
| Build outdated packages | yes                 | an archived device has no prebuilt packages                         |

## 2. Apply the patches

`init` downloads two git checkouts: pmbootstrap itself, and **pmaports**, the
package recipes (in `cache_git/pmaports`). The fixes are patches against both:

```sh
scripts/apply-patches.sh
```

| Patch                                          | Fixes                                                     |
| ---------------------------------------------- | --------------------------------------------------------- |
| pmbootstrap `0001` cross binutils with clang   | the kernel build failing with a misleading compiler error |
| pmaports `0001` gzip the initramfs             | a boot loop: the kernel cannot unpack a zstd initramfs    |
| pmaports `0002` installer: 512-byte partitions | boot stops at "failed to mount subpartitions"             |
| pmaports `0003` initramfs: no direct I/O       | boot stops at "unable to mount root partition"            |
| pmaports `0004` kernel: Docker options         | Docker containers cannot start                            |

The script is safe to re-run; it skips patches that are already applied. A
`pmbootstrap pull` will conflict with them, so after updating, reset the two
checkouts and run it again.

## 3. Pre-download the flaky sources

Two sources fail to download often enough to plan for. The Wi-Fi firmware comes
from `dumps.tadiphone.dev`, which refused every connection while this was
written, and the kernel source is a large GitHub tarball. The seed script
downloads the kernel with retries, takes the firmware from an older A51
postmarketOS recovery zip if you have one, checks every file against the
checksum in its recipe, and puts it where the build looks first:

```sh
scripts/seed-distfiles.sh path/to/an-old-pmos-samsung-a51.zip
```

<Annotation>
  The firmware is Samsung's and cannot be redistributed, which is why it is not
  in the repository. Without an old zip, the build fetches it from
  tadiphone itself; try again later if that host is down.
</Annotation>

## 4. Build the packages

The kernel takes ten minutes or more to build, after which pmbootstrap needs
`sudo` again — and if nobody types the password within five minutes, it fails
with `sudo: timed out reading password`. Keep sudo's credentials fresh in the
background for the length of the build:

```sh
sudo -v; while true; do sudo -n -v; sleep 60; done &
```

Then build the two patched packages that the image depends on:

```sh
pmbootstrap build postmarketos-initramfs --arch aarch64
pmbootstrap build postmarketos-android-recovery-installer --arch aarch64
```

`--arch aarch64` matters. Both packages are `noarch`, and without it
pmbootstrap builds them only for the PC's own architecture. The phone image then
quietly installs the unpatched version from the online repository, and the
boot fails exactly as if the patch had not been applied.

## 5. Build the recovery zip

TWRP installs postmarketOS from a zip, which pmbootstrap builds:

```sh
pmbootstrap install --android-recovery-zip --recovery-install-partition=userdata
kill %1   # stop the sudo loop
```

It asks for the password of the phone user, builds the kernel, and writes the
zip to
`chroot_buildroot_aarch64/var/lib/postmarketos-android-recovery-installer/pmos-samsung-a51.zip`.

`--recovery-install-partition=userdata` is essential on the A51. The default is
`system`, but on this phone `system` is a logical partition inside `super`, and
the installer fails with `findfs: unable to resolve 'PARTLABEL=system'`.
`userdata` is a real partition, and at about 111 GiB it is also the largest one.

<Annotation>
  To rebuild after changing a package that is already in the image, run
  `pmbootstrap zap` first. `install` reuses the root filesystem it built last
  time and does not upgrade what is already in it.
</Annotation>

## 6. Install from TWRP

Boot the phone into TWRP: power it off, then hold **Volume Up + Power** until
the logo appears. Go to **Advanced → ADB Sideload**, leave both wipe options
unticked, and swipe to start. On the PC:

```sh
adb devices      # the phone shows as "sideload"
adb sideload chroot_buildroot_aarch64/var/lib/postmarketos-android-recovery-installer/pmos-samsung-a51.zip
```

If `adb devices` lists more than one device, an emulator for example, add
`-s <serial>` to every adb command.

There is no need to format or wipe anything first. The usual TWRP routine of
formatting data and wiping caches exists so that a zip can be copied onto the
phone's internal storage. Sideload streams it over USB instead, and the
installer repartitions `userdata` itself.

The installer prints `Installation done.` on the phone. adb on the PC may
stop at about 50% with `adb: failed to read command: Success`. That is normal:
the phone has read everything it needs. Choose **Reboot → System**.

{/* SCREENSHOT twrp-done.png: TWRP showing "Installation done." Replace this comment with ![TWRP after a successful install](/files/postmarketos-on-a-samsung-galaxy-a51/twrp-done.png) */}

## 7. First boot and SSH

The first boot shows the postmarketOS logo, then stops at **Switching root**
for about a minute before the console login appears. That pause is normal on
this kernel.

The phone is also a USB network adapter: plugged into the PC, it is
`172.16.42.1`. It is supposed to hand the PC an address too, but often does not;
give the PC one by hand (find the interface name with `ip link`; this lasts
until the cable is unplugged):

```sh
nmcli device modify enp10s0u2 ipv4.method manual ipv4.addresses 172.16.42.2/24
ssh user@172.16.42.1
```

Log in with the password you chose in step 5, then copy your SSH key over:

```sh
ssh-copy-id user@172.16.42.1
```

The recovery zip leaves out `/home`, so the keys pmbootstrap copied in step 1
never reach the phone. And the installer creates the home directory with
ownership the SSH server rejects, so key login keeps asking for the password
until you fix it once, on the phone:

```sh
sudo chown -R "$USER:$USER" ~
chmod 755 ~; chmod 700 ~/.ssh; chmod 600 ~/.ssh/authorized_keys
```

Finally, delete a file the build left behind:

```sh
sudo rm /in-pmbootstrap
```

pmbootstrap creates it while building and it ends up in the zip. While it
exists, every kernel update on the phone prints
`mkinitfs: skipping (running in pmbootstrap)` and silently keeps the old boot
image.

## 8. Connect to Wi-Fi

NetworkManager handles Wi-Fi. Run these in an SSH session over USB, so you do
not lose the connection you are changing:

```sh
sudo nmcli dev wifi connect 'MY_NETWORK' password 'WIFI_PASSWORD' name home-wifi
sudo nmcli con modify home-wifi \
  802-11-wireless.cloned-mac-address stable \
  802-11-wireless.powersave 2
sudo nmcli con up home-wifi
```

The two extra settings matter for a server. The Wi-Fi chip has no MAC address
stored on this phone, so the driver makes up a random one at every boot, and the
router hands out a different address each time; `stable` derives a fixed MAC
from the connection instead. `powersave 2` turns power saving off.

For a server you also want an address that never changes. Either reserve one
for the phone in the router, or set it on the phone. Pick an address outside
the router's DHCP range; this example uses `192.168.0.53` on a
`192.168.0.0/24` network with the router at `192.168.0.1`:

```sh
sudo nmcli con modify home-wifi \
  ipv4.method manual \
  ipv4.addresses 192.168.0.53/24 \
  ipv4.gateway 192.168.0.1 \
  ipv4.dns "192.168.0.1 1.1.1.1" \
  connection.autoconnect yes
sudo nmcli con up home-wifi
```

You can also set up a network the phone is not in range of yet, before taking it
there: create the profile with
`sudo nmcli con add type wifi ifname wlan0 con-name server-wifi ssid 'NEW_NETWORK' wifi-sec.key-mgmt wpa-psk wifi-sec.psk 'WIFI_PASSWORD'`,
apply the settings above to it, and it connects by itself when it sees the
network.

Check it with `ip -br a show wlan0` and `ping -c3 alpinelinux.org`. From here
on you can unplug the cable and `ssh user@192.168.0.53`.

## 9. Install Docker

Docker needs a kernel built with the options from patch `0004`. If you built
the zip after applying the patches, you already have it. If you are adding
Docker to a phone that is already set up, see
[updating the kernel](#updating-the-kernel-without-reinstalling) below.

The A51 runs the SSH server Dropbear, which has no SFTP, so `scp` fails with
`sftp-server: not found`. Pipe files through `ssh` instead:

```sh
ssh user@PHONE "cat > setup-docker.sh" < scripts/phone/setup-docker.sh
ssh user@PHONE
sudo sh ~/setup-docker.sh
sudo reboot
```

The script installs Docker, Compose and crun, and makes four changes that
Docker needs on this kernel; each is explained
[at the end](#why-docker-needs-these-changes). Log in again after the reboot so
that your user is in the `docker` group, then try it:

```sh
docker run --rm hello-world
docker run -d --name web -p 8080:80 nginx:alpine
curl -I http://PHONE:8080     # from the PC: HTTP/1.1 200 OK
docker rm -f web
```

`docker info` should show `Cgroup Version: 1` and `Default Runtime: crun`, with
only one warning: that cgroup v1 support is deprecated.

## 10. Pin the patched initramfs

The phone runs the patched `postmarketos-initramfs` you built in step 4, as
version `3.12.5-r1`, while the online repository has `3.12.5-r0`. Yours is
newer, so it wins — until upstream publishes a newer version. Then
`apk upgrade` replaces it with the unpatched one, rebuilds the boot image, and
the next boot stops at `unable to mount root partition!`. Pin it:

```sh
sudo apk add postmarketos-initramfs=3.12.5-r1
```

Use the version `apk policy postmarketos-initramfs` shows as installed. The
kernel is already pinned the same way by the installer. If an upgrade ever
needs a newer initramfs, apk now refuses and says so instead of breaking the
boot; the patch then has to be rebuilt against the new version.

The same goes for upgrades in general: `edge` changes daily, so run
`apk upgrade` on purpose, read what it does, and reboot while the phone is in
reach.

## 11. Limit the battery charge

A phone that sits on its charger at 100% around the clock wears its battery
out, and a swollen battery is the usual way old phones die. Samsung's battery
driver has the switch behind One UI's **Protect battery** option: write a
percentage to `batt_full_capacity`, and the phone stops charging there and
starts again 2% below it. It only turns charging off; the phone keeps running
from the charger.

The setting is lost at every boot, so set it from a script that OpenRC's
`local` service runs at startup. Paste these as separate commands — when
`sudo` asks for a password, it swallows the rest of a multi-line paste:

```sh
printf '#!/bin/sh\necho 80 > /sys/class/power_supply/battery/batt_full_capacity\n' | sudo tee /etc/local.d/battery-limit.start
sudo sh -c 'chmod +x /etc/local.d/battery-limit.start && /etc/local.d/battery-limit.start'
```

A few seconds later, the battery reports that it has stopped:

```sh
cat /sys/class/power_supply/battery/status     # Not charging
dmesg | grep "stop charging"                   # stop charging(95, 80)
```

Above the limit it drifts down slowly on its own; from then on it holds
between 78% and 80%.

<Annotation>
  The driver also has a `store_mode`, meant for demo phones in shops, which
  holds the battery between 60% and 70%. It cannot be turned off again without
  a reboot, so `batt_full_capacity` is the better switch.
</Annotation>

That is the install. The rest of this page is for living with it, and for when
something goes wrong.

## Updating the kernel without reinstalling

Reinstalling wipes everything you set up on the phone, so a rebuilt kernel is
installed in place. On the PC:

```sh
pmbootstrap build linux-samsung-a51
apk=linux-samsung-a51-4.14.113-r2.apk     # the version you just built
ssh user@PHONE "cat > $apk" < packages/edge/aarch64/$apk
ssh user@PHONE "cat > install-kernel.sh" < scripts/phone/install-kernel.sh
```

On the phone:

```sh
sudo sh ~/install-kernel.sh ~/linux-samsung-a51-4.14.113-r2.apk
sudo reboot
```

The script saves the current boot partition to `~/boot-backup.img`, installs
the package, rebuilds the boot image, and only writes it to the boot partition
if it really was rebuilt.

If the new kernel does not boot, restore the old one from TWRP:

```sh
adb push boot-backup.img /tmp/
adb shell dd if=/tmp/boot-backup.img of=/dev/block/by-name/boot
```

## Troubleshooting

**The kernel build fails with `-fstack-protector-strong not supported by
compiler`.** The pmbootstrap patch is not applied. The compiler is fine; it has
no assembler. See [why](#why-the-kernel-needs-binutils).

**The kernel build fails with `sudo: timed out reading password`.** The build
outlived sudo's prompt. The kernel package is kept, so run the same command
again, with the sudo loop from step 4.

**`pmbootstrap install` fails with `tar: /mnt/rootfs_samsung-a51: Cannot
open`.** A package was built in the middle of the install, which resets the
chroot the install was working in. Run it again, or build the packages first as
in step 4.

**`adb` sits at "waiting for device", or does not list the phone.** Something
else is holding the phone's USB connection — usually the adb server that
`pmbootstrap flasher` starts as root. Stop it with `sudo adb -P 5038
kill-server`, and use the PC's own adb rather than `pmbootstrap flasher`.

**TWRP fails with "Extracting partition table... Failed".** Read the
installer's log: `adb shell cat /tmp/postmarketos/pmos.log`. If it says
`findfs: unable to resolve 'PARTLABEL=system'`, the zip was built without
`--recovery-install-partition=userdata`.

**The phone shows the logo, then reboots straight away, again and again.** The
kernel panicked. Boot into TWRP and read the crash log with
`adb shell cat /sys/fs/pstore/console-ramoops-0`. If it ends with
`Unable to mount root fs on unknown-block(1,0)`, the initramfs is zstd and the
gzip patch is missing. See [why](#why-the-initramfs-must-be-gzip).

**Boot stops with a debug screen saying `failed to mount subpartitions!`.** The
zip was built with an unpatched recovery installer — usually because it was
built without `--arch aarch64`. See [why](#why-the-partition-table-is-rewritten).

**Boot stops with `unable to mount root partition!`.** The initramfs is
unpatched. Same cause, same fix. See [why](#why-direct-io-is-turned-off).

**After an `apk upgrade`, boot stops with `unable to mount root partition!`.**
The upgrade replaced the patched initramfs. Restore `boot-backup.img` from
TWRP if you have one, or install the patched initramfs package again and run
`sudo mkinitfs`, then pin it as in step 10.

**The battery still says `Charging` right after setting the limit.** The driver
applies the limit on its next check. Read `status` again a few seconds later.

**SSH key login keeps asking for the password.** The home directory
permissions; see step 7.

**A kernel update changes nothing after a reboot.** `/in-pmbootstrap` is still
on the phone; see step 7.

**Docker says `runc did not terminate successfully: exit status 2`.** Docker is
still on runc; the script sets crun as the default runtime.

**Containers fail with `bpf create: Invalid argument`, `Out of memory` or
`open /sys/fs/cgroup/blkio/...: No such file or directory`.** In that order:
the phone was not rebooted after the setup script, the `schedtune` line is
missing from `/etc/rc.conf`, or the kernel is older than the one with patch
`0004`. See [why](#why-docker-needs-these-changes).

**Docker fails to start, and its log mentions `checkpath: not found`.** The
`PATH` line in `/etc/conf.d/docker` replaces the path instead of adding to it.
Re-run the setup script, which fixes it.

## How to debug a phone that will not boot

These are the tools that found every problem in this guide.

- **The crash log.** A kernel panic survives a reboot in memory. Boot into TWRP
  immediately and read `/sys/fs/pstore/console-ramoops-0`.
- **The installer log.** TWRP keeps it in `/tmp/postmarketos/pmos.log` until it
  reboots.
- **A shell inside the boot process.** When the initramfs fails, it shows a
  debug screen with an on-screen keyboard. Type `telnetd -l /bin/sh`, give the
  PC an address as in step 7, and connect with `nc 172.16.42.1 23`. You are now
  root inside the failed boot: `/pmOS_init.log` says what happened, and
  `/init_functions.sh` is the code that did it. You can fix it in place and
  run a step again.
- **Comparing with a build that worked.** An old recovery zip contains the
  whole root filesystem, initramfs included. Unpacking one is how the cause of
  the partition problem was found.

## What each fix is for

### Why the kernel needs binutils

The A51's kernel builds with clang but tells it not to use its built-in
assembler (`-no-integrated-as`), so clang calls the GNU assembler for ARM64.
For clang builds, pmbootstrap installed only clang, with no assembler. Every
compiler-feature check the kernel's build runs then fails, and the first one to
report it happens to be the stack protector check — so the error points at the
compiler when the assembler is what is missing.

The obvious fix, adding `binutils-aarch64` to the kernel's build dependencies,
does not work: pmbootstrap looks the dependency up among the phone's
packages, and the cross assembler only exists as a PC package. So the patch is
to pmbootstrap, which now installs the assembler alongside clang:

```python
elif "clang" in depends or "clang-dev" in depends:
    # Kernels built with -no-integrated-as need the cross binutils
    cross_pkgs += ["clang", "binutils-" + arch_str]
```

### Why the initramfs must be gzip

The initramfs is the small filesystem the kernel unpacks first, whose job is to
find and mount the real one. In July 2026 postmarketOS switched its default
compression to zstd, and in September added
`deviceinfo_initfs_compression="gzip"` to every device whose kernel is too old
to read zstd. The A51 had been archived in August and was not on the list.

Its 4.14 kernel cannot unpack zstd, so it finds no initramfs, looks for a root
filesystem it was never given, and panics — the boot loop. The patch adds the
same line to the A51's device package.

### Why the partition table is rewritten

postmarketOS lives inside the `userdata` partition, which holds its own small
partition table with a boot and a root partition. Two different programs read
that table, and on this phone they disagreed about its units.

The A51's UFS storage has **4096-byte sectors**, where most disks have 512.
Partition tables count in sectors, so the installer, which writes the table
directly on the storage, writes it in 4096-byte units. Until February 2026 the
initramfs read it with `kpartx`, which also uses the disk's real sector size:
the two agreed. Then the initramfs switched to loop devices, which read the
table in 512-byte units. Every number in the table now pointed eight times too
early, and the initramfs found no partitions.

Loop devices can be told to use 4096-byte sectors, but this kernel ignores
the setting. The fix is at the other end: after partitioning, the installer
multiplies each start and size in the table by `sector_size / 512`, so the same
byte positions are described in 512-byte units:

```sh
convert_table_to_512_byte_units() {
	local sector_size factor i entry start size
	sector_size="$(blockdev --getss "$1")"
	[ "$sector_size" -gt 512 ] || return 0
	factor=$((sector_size / 512))
	# for each of the two partition entries in the MBR:
	#   read start and size, write them back multiplied by $factor
}
```

The filesystems do not move, and nothing changes on an ordinary 512-byte disk.

<Annotation>
  The first attempt partitioned through a 512-byte loop device instead. It
  works on any Linux, but not in TWRP: TWRP enforces SELinux, which denies the
  loop device access to the storage, and every write returned an I/O error.
</Annotation>

### Why direct I/O is turned off

With the partitions found, the next boot failed to mount the root partition.
The kernel log explained it:

```
exynos-ufs 13520000.ufs: Invalid bio
print_req_error: I/O error, dev loop0, sector 499712
```

The initramfs creates its loop devices with direct I/O, which passes each
request straight to the storage instead of through the page cache. The loop
device works in 512-byte pieces and this storage only accepts 4096-byte ones, so
the storage driver rejects them. The patch only turns direct I/O on when the
partition's sector size matches the loop device's:

```sh
local direct_io="--direct-io=on"
local part_sector_size
part_sector_size="$(blockdev --getss "$partition" 2>/dev/null)"
if [ "$part_sector_size" != "$loop_sector_size" ]; then
	echo "$partition has ${part_sector_size:-unknown}-byte sectors," \
		"loop has $loop_sector_size: not using direct I/O"
	direct_io=""
fi
```

Both this problem and the previous one come from the same change, and neither
would show up on a phone with 512-byte storage or a newer kernel. That is how an
archived device breaks: nobody with one is around to try the change.

### Why Docker needs these changes

**Kernel options.** Docker ships a script, `contrib/check-config.sh`, that
reads a kernel config and lists what is missing. For the A51 it listed
container networking (`VETH`, `BRIDGE`, NAT for IPv6), device control for
containers (`CGROUP_DEVICE`), POSIX message queues and more. Patch `0004`
enables them, plus the block I/O controller (`BLK_CGROUP`) that crun turned out
to need. The config was regenerated with `make olddefconfig` on the kernel
source, because just adding lines to the config file loses any option whose
dependencies are not also enabled — silently.

**Legacy iptables.** Docker sets up container networking with `iptables`.
Alpine's `iptables` is the nf_tables version, and this kernel has no nf_tables,
so the script points Docker at the `iptables-legacy` tools.

**crun instead of runc.** runc, the program that actually starts containers,
crashes on this kernel for every container (`at least one candidate
/proc/thread-self path should work`); Docker only reports that runc exited.
[crun](https://github.com/containers/crun) does the same job and works.

**cgroup v1.** Containers get their limits from control groups, and there are
two versions of them. The newer v2 controls a container's devices with a BPF
program type that arrived in Linux 4.15 — one version after this kernel — and on
4.14 it has no CPU controller either. So OpenRC runs in its `hybrid` mode and
Docker uses v1. Docker warns that it will drop v1 support, planned for 2029.

**Android's schedtune.** In hybrid mode OpenRC mounts every v1 controller the
kernel has, including `schedtune`, an Android scheduler controller that only
allows a handful of groups. crun creates one per container, and once the slots
run out it fails with `Out of memory` — of slots, not memory. Telling OpenRC not
to mount it (`rc_cgroup_controllers="schedtune"`) makes it disappear.

## Known limitations

**No firewall.** postmarketOS's firewall is nftables, which this kernel does not
have. Every port a container publishes is reachable from your network. That is
fine at home; choose what you publish with that in mind.

**Wi-Fi latency.** Pings to the phone take 10 to 100 ms even with power saving
off and a strong 5 GHz signal. The maximum matches the router's beacon interval,
which suggests the Wi-Fi chip's firmware still saves power on its own, and the
driver offers no setting to stop it. For services like DNS it does not matter.

**A minute at "Switching root".** Every boot pauses there for about a minute
before the system comes up. It has not been investigated.

**A downstream kernel.** 4.14 is Samsung's Android kernel and will not get
newer. Everything above works around its age; at some point a newer Docker will
not.
