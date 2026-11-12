
import soljson from "https://cdn.jsdelivr.net/npm/solc@0.8.27/soljson.js/+esm";
import wrapper from "https://cdn.jsdelivr.net/npm/solc@0.8.27/wrapper/+esm";

let compiler;

try {
  compiler = wrapper(soljson);
} catch (error) {
  self.postMessage({
    ok: false,
    error: "Solidity compiler initialization failed: " +
      (error.message || String(error))
  });
}

self.onmessage = (event) => {
  try {
    if (!compiler) {
      throw new Error("Compiler is not initialized.");
    }

    const input = {
      language: "Solidity",
      sources: {
        "DABELA.sol": {
          content: event.data.source
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

    const output = JSON.parse(
      compiler.compile(JSON.stringify(input))
    );

    const errors = (output.errors || []).filter(
      error => error.severity === "error"
    );

    if (errors.length) {
      throw new Error(
        errors.map(error => error.formattedMessage).join("\n")
      );
    }

    const contract =
      output.contracts["DABELA.sol"]["DABELA"];

    self.postMessage({
      ok: true,
      abi: contract.abi,
      bytecode: "0x" + contract.evm.bytecode.object,
      version: compiler.version()
    });

  } catch (error) {
    self.postMessage({
      ok: false,
      error: error.message || String(error)
    });
  }
};
