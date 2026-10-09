import AppKit
import CoreGraphics
import Foundation

func fail(_ message: String) -> Never {
    FileHandle.standardError.write(Data((message + "\n").utf8))
    exit(1)
}

let args = CommandLine.arguments
guard args.count >= 2 else { fail("Comando inválido") }
guard CGPreflightPostEventAccess() else {
    _ = CGRequestPostEventAccess()
    fail("Libere Electron/Nowframe ou native-cursor em Ajustes do Sistema > Privacidade e Segurança > Acessibilidade. Depois tente F8 novamente.")
}
if args[1] == "check" { exit(0) }
guard args.count == 6,
      let x = Double(args[2]), let y = Double(args[3]),
      let duration = Double(args[4]), let pid = Int32(args[5]),
      x.isFinite, y.isFinite, duration.isFinite,
      duration >= 0, duration <= 5000 else { fail("Coordenadas inválidas") }

func ensureFocus() {
    guard NSWorkspace.shared.frontmostApplication?.processIdentifier == pid else {
        fail("Demonstração interrompida: Nowframe perdeu o foco")
    }
}

func post(_ type: CGEventType, _ point: CGPoint) {
    ensureFocus()
    guard let event = CGEvent(mouseEventSource: nil, mouseType: type,
                             mouseCursorPosition: point, mouseButton: .left) else {
        fail("Não foi possível criar o evento do mouse")
    }
    event.post(tap: .cghidEventTap)
}

let target = CGPoint(x: x, y: y)
if args[1] == "click" {
    ensureFocus()

    signal(SIGTERM, SIG_IGN)
    guard let down = CGEvent(mouseEventSource: nil, mouseType: .leftMouseDown,
                             mouseCursorPosition: target, mouseButton: .left),
          let up = CGEvent(mouseEventSource: nil, mouseType: .leftMouseUp,
                           mouseCursorPosition: target, mouseButton: .left) else {
        fail("Não foi possível criar o clique")
    }
    down.setIntegerValueField(.mouseEventClickState, value: 1)
    up.setIntegerValueField(.mouseEventClickState, value: 1)
    down.post(tap: .cghidEventTap)
    up.post(tap: .cghidEventTap)
} else if args[1] == "move" {
    guard let origin = CGEvent(source: nil)?.location else { fail("Mouse indisponível") }
    let started = ProcessInfo.processInfo.systemUptime
    let seconds = duration / 1000
    repeat {
        let elapsed = ProcessInfo.processInfo.systemUptime - started
        let fraction = seconds > 0 ? min(1, elapsed / seconds) : 1
        let eased = fraction * fraction * (3 - 2 * fraction)
        post(.mouseMoved, CGPoint(x: origin.x + (target.x - origin.x) * eased,
                                  y: origin.y + (target.y - origin.y) * eased))
        if fraction >= 1 { break }
        Thread.sleep(forTimeInterval: 1 / 120)
    } while true
} else {
    fail("Comando desconhecido")
}
