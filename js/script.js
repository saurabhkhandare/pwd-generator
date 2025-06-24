const passwordDisplay = document.querySelector(".password-display");
const passwordCopyButton = document.querySelector(".copy-btn");
const passwordCopiedNotification = document.querySelector(
  ".copied-notification"
);
const passwordForm = document.querySelector(".password-settings_wrapper");
const passwordLengthSlider = document.querySelector(".password-length__slider");
const passwordLength = document.querySelector(".password-length");
const checkboxes = document.querySelectorAll("input[type=checkbox]");
const strengthRating = document.querySelector(".password-strength-rating");
const strengthIndicator = document.querySelectorAll(".indicator");

const CHARACTER_SET = {
  uppercase: ["ABCDEFGHIJKLMNOPQRSTUVWXYZ", 26],
  lowercase: ["abcdefghijklmnopqrstuvwxyz", 26],
  numbers: ["1234567890", 10],
  symbols: ["!#$%&'()*+,-./:;<=>?@[]^_`{|}~", 30], // https://owasp.org/www-community/password-special-characters
};

let copyPossible = false;

const setPasswordLength = () => {
  passwordLength.textContent = passwordLengthSlider.value;
};

const styleRangeSlider = () => {
  const min = passwordLengthSlider.min;
  const max = passwordLengthSlider.max;
  const val = passwordLengthSlider.value;

  passwordLengthSlider.style.backgroundSize =
    ((val - min) * 100) / (max - min) + "% 100%";
};

const handleSliderInputChange = () => {
  setPasswordLength();
  styleRangeSlider();
};

const resetIndicatorStyles = () => {
  strengthIndicator.forEach((indicator) => {
    indicator.style.backgroundColor = "transparent";
    indicator.style.borderColor = "hsl(252, 11%, 91%)";
  });
};

const addStyle = (indicators, color) => {
  indicators.forEach((indicator) => {
    indicator.style.backgroundColor = color;
    indicator.style.borderColor = color;
  });
};

const styleIndicators = (passwordStrength) => {
  const rating = passwordStrength[0];
  const ratinginNumber = passwordStrength[1];
  const indicatorsToFill = Array.from(strengthIndicator).slice(
    0,
    ratinginNumber
  );

  resetIndicatorStyles();

  strengthRating.textContent = rating;

  switch (ratinginNumber) {
    case 1:
      return addStyle(indicatorsToFill, "hsl(0, 91%, 63%)");
    case 2:
      return addStyle(indicatorsToFill, "hsl(13, 95%, 66%)");
    case 3:
      return addStyle(indicatorsToFill, "hsl(42, 91%, 68%)");
    case 4:
      return addStyle(indicatorsToFill, "hsl(127, 100%, 82%");
    default:
      throw new Error("Invalid value");
  }
};

const calculatePasswordStrength = (passwordLength, charPoolSize) => {
  const strength = passwordLength * Math.log2(charPoolSize);

  if (strength < 25) {
    return ["Too Weak", 1];
  } else if (strength >= 25 && strength < 50) {
    return ["Weak", 2];
  } else if (strength >= 50 && strength < 75) {
    return ["Medium", 3];
  } else {
    return ["Strong", 4];
  }
};

const generatePassword = (e) => {
  e.preventDefault();

  try {
    if (Array.from(checkboxes).every((box) => box.checked === false)) {
      throw new Error("Choose an option");
    }

    const includedSets = [];
    let charPool = 0;
    let generatedPassword = "";

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        includedSets.push(CHARACTER_SET[checkbox.value][0]);
        charPool += CHARACTER_SET[checkbox.value][1];
      }
    });

    if (includedSets) {
      for (let i = 0; i < passwordLengthSlider.value; i++) {
        const randomSetIndex = Math.floor(Math.random() * includedSets.length);
        const randomSet = includedSets[randomSetIndex];

        const randomCharIndex = Math.floor(Math.random() * randomSet.length);
        const randomChar = randomSet[randomCharIndex];

        generatedPassword += randomChar;
      }
    }

    const strength = calculatePasswordStrength(
      passwordLengthSlider.value,
      charPool
    );

    styleIndicators(strength);

    passwordDisplay.value = generatedPassword;

    copyPossible = true;
    passwordCopyButton.disabled = false;
  } catch (err) {
    console.log(err);
  }
};

const copyPassword = async () => {
  if (!copyPossible) return;

  await navigator.clipboard.writeText(passwordDisplay.value);

  passwordCopiedNotification.textContent = "Copied";
  passwordCopiedNotification.style.animation = "fadeOut 5s";
  passwordCopiedNotification.style.transition = "opacity 1s";

  setTimeout(() => {
    passwordCopiedNotification.textContent = "";
    passwordCopiedNotification.style.removeProperty("animation");
    passwordCopiedNotification.style.removeProperty("transition");
  }, 1000);
};

setPasswordLength();

passwordCopyButton.addEventListener("click", copyPassword);
passwordLengthSlider.addEventListener("input", handleSliderInputChange);
passwordForm.addEventListener("submit", generatePassword);
