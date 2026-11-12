
import solc from "https://esm.sh/solc@0.8.27?bundle";

self.onmessage = (event) => {
  try {
    const source = event.data.source;

    const input = {
      language: "Solidity",

      sources: {
        "DABELA.sol": {
          content: source
        }
      },

      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },

        outputSelection: {
          "*": {
            "*": [
              "abi",
              "evm.bytecode.object"
            ]
          }
        }
      }
    };

    const raw = solc.compile(JSON.stringify(input));
    const output = JSON.parse(raw);

    const errors = (output.errors || []).filter(
      e => e.severity === "error"
    );

    if (errors.length) {
      self.postMessage({
        ok: false,
        error: errors
          .map(e => e.formattedMessage)
          .join("\n")
      });

      return;
    }

    const contract =
      output.contracts?.["DABELA.sol"]?.DABELA;

    if (!contract?.evm?.bytecode?.object) {
      self.postMessage({
        ok: false,
        error: "Compiler returned no deployment bytecode."
      });

      return;
    }

    self.postMessage({
      ok: true,
      abi: contract.abi,
      bytecode: "0x" + contract.evm.bytecode.object,
      version: solc.version()
    });

  } catch (err) {
    self.postMessage({
      ok: false,
      error: err?.message || String(err)
    });
  }
};
